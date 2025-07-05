import { z } from "zod";
import config from "../config";
import { ComfyPrompt } from "@/types/ComfyPrompt";

let diffusion_model: any = config.models.diffusion_models.enum.optional();
if (config.warmupCkpt) {
  diffusion_model = diffusion_model.default(config.warmupCkpt);
} else if (
  config.models.diffusion_models.enum.options.includes(
    "flux1-dev-kontext_fp8_scaled.safetensors"
  )
) {
  diffusion_model = diffusion_model.default(
    "flux1-dev-kontext_fp8_scaled.safetensors"
  );
}

let clip_l_model: any = config.models.text_encoders.enum.optional();
if (
  config.models.text_encoders.enum.options.includes("clip_l.safetensors")
) {
  clip_l_model = clip_l_model.default("clip_l.safetensors");
}

let clip_g_model: any = config.models.text_encoders.enum.optional();
if (
  config.models.text_encoders.enum.options.includes(
    "t5xxl_fp8_e4m3fn_scaled.safetensors"
  )
) {
  clip_g_model = clip_g_model.default("t5xxl_fp8_e4m3fn_scaled.safetensors");
}

let vae_model: any = config.models.vae.enum.optional();
if (config.models.vae.enum.options.includes("ae.safetensors")) {
  vae_model = vae_model.default("ae.safetensors");
}

interface Workflow {
  RequestSchema: z.ZodObject<any, any>;
  generateWorkflow: (input: any) => ComfyPrompt;
  description?: string;
  summary?: string;
}

const RequestSchema = z.object({
  prompt: z
    .string()
    .describe("The editing instruction or prompt, e.g., 'Change the background to a beach'"),
  image_1: z
    .string()
    .describe(
      "The first image to use as context (can be a URL or base64 encoded string)"
    ),
  image_2: z
    .string()
    .optional()
    .describe(
      "The second image to stitch with the first one (can be a URL or base64 encoded string)"
    ),
  stitch_direction: z
    .enum(["right", "left", "bottom", "top"])
    .optional()
    .default("right")
    .describe("Direction to stitch the second image relative to the first"),
  feathering: z
    .number()
    .min(0)
    .optional()
    .default(0)
    .describe("The amount of feathering to apply at the seam of stitched images"),
  seed: z
    .number()
    .int()
    .optional()
    .default(() => Math.floor(Math.random() * 1000000000000000))
    .describe("Seed for random number generation"),
  steps: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe("Number of sampling steps"),
  cfg_scale: z
    .number()
    .min(0)
    .max(20)
    .optional()
    .default(2.5)
    .describe("Classifier-free guidance scale"),
  sampler_name: config.samplers
    .optional()
    .default("euler")
    .describe("Name of the sampler to use"),
  scheduler: config.schedulers
    .optional()
    .default("simple")
    .describe("Type of scheduler to use"),
  denoise: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .default(1)
    .describe("Denoising strength"),
  diffusion_model,
  clip_l_model,
  clip_g_model,
  vae_model,
});

type InputType = z.infer<typeof RequestSchema>;

function generateWorkflow(input: InputType): ComfyPrompt {
  const image_2_enabled = !!input.image_2;

  const image_source = image_2_enabled ? ["146", 0] : ["142", 0];

  const workflow: ComfyPrompt = {
    "6": {
      inputs: {
        text: input.prompt,
        clip: ["38", 0],
      },
      class_type: "CLIPTextEncode",
      _meta: {
        title: "CLIP Text Encode (Positive Prompt)",
      },
    },
    "8": {
      inputs: {
        samples: ["31", 0],
        vae: ["39", 0],
      },
      class_type: "VAEDecode",
      _meta: {
        title: "VAE Decode",
      },
    },
    "31": {
      inputs: {
        seed: input.seed,
        steps: input.steps,
        cfg: 1,
        sampler_name: input.sampler_name,
        scheduler: input.scheduler,
        denoise: input.denoise,
        model: ["37", 0],
        positive: ["35", 0],
        negative: ["135", 0],
        latent_image: ["124", 0],
      },
      class_type: "KSampler",
      _meta: {
        title: "KSampler",
      },
    },
    "35": {
      inputs: {
        guidance: input.cfg_scale,
        conditioning: ["177", 0],
      },
      class_type: "FluxGuidance",
      _meta: {
        title: "FluxGuidance",
      },
    },
    "37": {
      inputs: {
        unet_name: input.diffusion_model,
        lora_name: "default",
      },
      class_type: "UNETLoader",
      _meta: {
        title: "Load Diffusion Model",
      },
    },
    "38": {
      inputs: {
        clip_l: input.clip_l_model,
        clip_g: input.clip_g_model,
        type_l: "flux",
        type_g: "default",
      },
      class_type: "DualCLIPLoader",
      _meta: {
        title: "DualCLIPLoader",
      },
    },
    "39": {
      inputs: {
        vae_name: input.vae_model,
      },
      class_type: "VAELoader",
      _meta: {
        title: "Load VAE",
      },
    },
    "42": {
      inputs: {
        image: image_source,
      },
      class_type: "FluxKontextImageScale",
      _meta: {
        title: "FluxKontextImageScale",
      },
    },
    "124": {
      inputs: {
        pixels: ["42", 0],
        vae: ["39", 0],
      },
      class_type: "VAEEncode",
      _meta: {
        title: "VAE Encode",
      },
    },
    "135": {
      inputs: {
        conditioning: ["6", 0],
      },
      class_type: "ConditioningZeroOut",
      _meta: {
        title: "ConditioningZeroOut",
      },
    },
    "136": {
      inputs: {
        filename_prefix: "FluxKontext",
        images: ["8", 0],
      },
      class_type: "SaveImage",
      _meta: {
        title: "Save Image",
      },
    },
    "142": {
      inputs: {
        image: input.image_1,
      },
      class_type: "LoadImage",
      _meta: {
        title: "Load Image 1",
      },
    },
    "177": {
      inputs: {
        conditioning: ["6", 0],
        latent: ["124", 0],
      },
      class_type: "ReferenceLatent",
      _meta: {
        title: "ReferenceLatent",
      },
    },
  };

  if (image_2_enabled) {
    workflow["146"] = {
      inputs: {
        direction: input.stitch_direction,
        feathering_enabled: true,
        feathering: input.feathering,
        blending_mode: "normal",
        background_color: "white",
        image1: ["142", 0],
        image2: ["147", 0],
      },
      class_type: "ImageStitch",
      _meta: {
        title: "ImageStitch",
      },
    };
    workflow["147"] = {
      inputs: {
        image: input.image_2 as string,
      },
      class_type: "LoadImage",
      _meta: {
        title: "Load Image 2",
      },
    };
  }

  return workflow;
}

const workflow: Workflow = {
  RequestSchema,
  generateWorkflow,
  summary: "FLUX.1 Kontext Image Editing",
  description:
    "Uses an image (or two stitched images) as context for a text-based edit. This workflow is ideal for modifying existing images, changing backgrounds, transferring styles, and more, while maintaining consistency with the original context.",
};

export default workflow;
