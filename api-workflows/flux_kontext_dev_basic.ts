import { z } from "zod";
// This gets evaluated in the context of src/workflows, so imports must be relative to that directory
import { ComfyPrompt, Workflow } from "../types";
import config from "../config";

const RequestSchema = z.object({
  prompt: z
    .string()
    .optional()
    .default("remove clothes")
    .describe("The positive prompt for image generation/editing"),
  image: z.string().describe("Input image for editing (url or base64)"),
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
    .default(1)
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
  guidance: z
    .number()
    .min(0)
    .max(10)
    .optional()
    .default(2.5)
    .describe("FLUX-specific guidance parameter"),
  unet_name: z
    .enum(["redKFm00NSFWEditorFP8.Wtdk.safetensors", "flux1-dev-kontext_fp8_scaled.safetensors"])
    .optional()
    .default("redKFm00NSFWEditorFP8.Wtdk.safetensors")
    .describe("Name of the UNET diffusion model to use"),
  clip_1_name: z
    .enum(["clip_l.safetensors", "t5xxl_fp8_e4m3fn_scaled.safetensors"])
    .optional()
    .default("clip_l.safetensors")
    .describe("Name of the primary CLIP model"),
  clip_2_name: z
    .enum(["clip_l.safetensors", "t5xxl_fp8_e4m3fn_scaled.safetensors"])
    .optional()
    .default("t5xxl_fp8_e4m3fn_scaled.safetensors")
    .describe("Name of the secondary CLIP model"),
  vae_name: z
    .enum(["ae.safetensors"])
    .optional()
    .default("ae.safetensors")
    .describe("Name of the VAE model to use"),
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
        title: "VAE Decode",
      },
    },
    "31": {
      inputs: {
        seed: input.seed,
        steps: input.steps,
        cfg: input.cfg_scale,
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
        guidance: input.guidance,
        conditioning: ["177", 0],
      },
      class_type: "FluxGuidance",
      _meta: {
        title: "FluxGuidance",
      },
    },
    "37": {
      inputs: {
        unet_name: input.unet_name,
        weight_dtype: "default",
      },
      class_type: "UNETLoader",
      _meta: {
        title: "Load Diffusion Model",
      },
    },
    "38": {
      inputs: {
        clip_name1: input.clip_1_name,
        clip_name2: input.clip_2_name,
        type: "flux",
        device: "default",
      },
      class_type: "DualCLIPLoader",
      _meta: {
        title: "DualCLIPLoader",
      },
    },
    "39": {
      inputs: {
        vae_name: input.vae_name,
      },
      class_type: "VAELoader",
      _meta: {
        title: "Load VAE",
      },
    },
    "42": {
      inputs: {
        image: ["189", 0],
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
        images: ["8", 0],
      },
      class_type: "SaveImage",
      _meta: {
        title: "Save Image",
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
    "189": {
      inputs: {
        image: input.image,
      },
      class_type: "LoadImage",
      _meta: {
        title: "Load Image",
      },
    },
  };
}

const workflow: Workflow = {
  RequestSchema,
  generateWorkflow,
  summary: "FLUX Image-to-Image",
  description: "Image editing workflow using the FLUX (Kontext) model",
};

export default workflow;
