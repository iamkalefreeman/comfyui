import { z } from "zod";
// This gets evaluated in the context of src/workflows, so imports must be relative to that directory
import { ComfyPrompt, Workflow } from "../types";
import config from "../config";

// This workflow uses a specific FLUX UNET model. We assume a corresponding enum exists in the config.
// The name 'checkpoint' is used for user-facing consistency.
const checkpoint = (config.models as any).flux_unets?.enum
  .optional()
  .default("redKFm00NSFWEditorFP8.Wtdk.safetensors");

const RequestSchema = z.object({
  image: z
    .string()
    .describe(
      "Input image to use as a reference (URL or base64 encoded string)"
    ),
  prompt: z
    .string()
    .default("remove clothes")
    .describe("The positive prompt for image generation"),
  checkpoint: checkpoint.describe("The FLUX UNET model to use for generation"),
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
    .describe(
      "Guidance scale, controlling how closely the image adheres to the prompt"
    ),
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
    .describe(
      "Denoising strength. 1.0 means the original image's content is fully replaced."
    ),
});

type InputType = z.infer<typeof RequestSchema>;

function generateWorkflow(input: InputType): ComfyPrompt {
  return {
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
        title: "VAEDecode",
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
        unet_name: input.checkpoint,
      },
      class_type: "UNETLoader",
      _meta: {
        title: "UNETLoader",
      },
    },
    "38": {
      inputs: {
        clip1_name: "clip_l.safetensors",
        clip2_name: "t5xxl_fp8_e4m3fn_scaled.safetensors",
        text_encoder_type: "flux",
      },
      class_type: "DualCLIPLoader",
      _meta: {
        title: "DualCLIPLoader",
      },
    },
    "39": {
      inputs: {
        vae_name: "ae.safetensors",
      },
      class_type: "VAELoader",
      _meta: {
        title: "VAELoader",
      },
    },
    "42": {
      inputs: {
        image: ["142", 0],
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
        title: "VAEEncode",
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
        filename_prefix: "ComfyUI",
        images: ["8", 0],
      },
      class_type: "SaveImage",
      _meta: {
        title: "Save Image",
      },
    },
    "142": {
      inputs: {
        image: input.image,
        upload: "image",
      },
      class_type: "LoadImage",
      _meta: {
        title: "Load Image",
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
}

const workflow: Workflow = {
  RequestSchema,
  generateWorkflow,
  summary: "FLUX dev Image-to-Image",
  description:
    "An image-to-image workflow using the FLUX.1-dev model. It takes an input image and a prompt to generate a new image. This version uses separate loaders for the UNET, VAE, and CLIP models, and a specific `FluxGuidance` node for CFG scaling. The default settings are configured for NSFW-style image editing.",
};

export default workflow;
