import { z } from "zod";
// This gets evaluated in the context of src/workflows, so imports must be relative to that directory
import { ComfyPrompt, Workflow } from "../types";
import config from "../config";

const ComfyNodeSchema = z.object({
  inputs: z.any(),
  class_type: z.string(),
  _meta: z.any().optional(),
});

type ComfyNode = z.infer<typeof ComfyNodeSchema>;

interface Workflow {
  RequestSchema: z.ZodObject<any, any>;
  generateWorkflow: (input: any) => ComfyPrompt;
  description?: string;
  summary?: string;
}

const RequestSchema = z.object({
  prompt: z
    .string()
    .default("remove clothes")
    .describe("The positive prompt for image generation"),
  image: z
    .string()
    .describe("The reference image to use for context (URL or base64)"),
  guidance_scale: z
    .number()
    .min(0)
    .max(10)
    .default(2.5)
    .describe("The guidance scale for the FLUX model"),
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
    .describe("Classifier-free guidance scale for the KSampler"),
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
        guidance: input.guidance_scale,
        conditioning: ["177", 0],
      },
      class_type: "FluxGuidance",
      _meta: {
        title: "FluxGuidance",
      },
    },
    "37": {
      inputs: {
        unet_name: "flux1-dev-kontext_fp8_scaled.safetensors",
        id_name: "default",
      },
      class_type: "UNETLoader",
      _meta: {
        title: "UNETLoader",
      },
    },
    "38": {
      inputs: {
        clip_l_name: "clip_l.safetensors",
        clip_g_name: "t5xxl_fp8_e4m3fn_scaled.safetensors",
        id_name: "flux",
        clip_l_id_name: "default",
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
  summary: "FLUX Kontext",
  description:
    "A FLUX-based workflow that uses a reference image to provide context for the generation, similar to an IP-Adapter. It combines the reference image's content with a text prompt to generate a new image.",
};

export default workflow;
