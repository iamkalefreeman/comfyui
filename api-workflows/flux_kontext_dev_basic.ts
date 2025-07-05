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
  image: z.string().describe("The input image to edit, as a URL or base64 encoded string"),
  prompt: z.string().default("remove clothes").describe("A text prompt describing the desired edit or change to the image"),
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
    .describe("Classifier-Free Guidance scale, controlling how strongly the prompt influences the generation"),
  guidance: z
    .number()
    .min(0)
    .max(20)
    .optional()
    .default(2.5)
    .describe("Guidance scale for the FLUX model, controlling how strongly the reference image influences the generation"),
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
    .describe("Denoising strength. A value of 1.0 means the original image's latent is fully replaced by the new generation"),
  unet_name: z
    .string()
    .default("redKFm00NSFWEditorFP8.Wtdk.safetensors")
    .describe("Name of the UNET model file to use"),
  clip_name1: z
    .string()
    .default("clip_l.safetensors")
    .describe("Name of the first CLIP model file (clip_l) to use"),
  clip_name2: z
    .string()
    .default("t5xxl_fp8_e4m3fn_scaled.safetensors")
    .describe("Name of the second CLIP model file (t5xxl) to use"),
  vae_name: z
    .string()
    .default("ae.safetensors")
    .describe("Name of the VAE model file to use"),
});

type InputType = z.infer<typeof RequestSchema>;

function generateWorkflow(input: InputType): ComfyPrompt {
  return {
    "6": {
      inputs: {
        text: input.prompt,
        clip: ["38", 1],
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
        clip_name1: input.clip_name1,
        clip_name2: input.clip_name2,
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
        image: ["146", 0],
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
        image: input.image,
      },
      class_type: "LoadImage",
      _meta: {
        title: "Load Image",
      },
    },
    "146": {
      inputs: {
        direction: "right",
        match_image_size: true,
        spacing_width: 0,
        spacing_color": "white",
        image1: ["142", 0],
      },
      class_type: "ImageStitch",
      _meta: {
        title: "Image Stitch",
      },
    },
    "173": {
      inputs: {
        images: ["42", 0],
      },
      class_type: "PreviewImage",
      _meta: {
        title: "Preview Image",
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
  summary: "FLUX Image Editing",
  description: "An advanced image editing workflow using the FLUX model. It takes an input image and a text prompt to modify the image, using the original image as a reference.",
};

export default workflow;
