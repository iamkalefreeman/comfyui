import { z } from "zod";
// This gets evaluated in the context of src/workflows, so imports must be relative to that directory
import { ComfyPrompt, Workflow } from "../types";
import config from "../config";

const RequestSchema = z.object({
  image: z
    .string()
    .describe("Input image for editing (URL or base64 encoded string)"),
  prompt: z
    .string()
    .default("replace background with beach scene")
    .describe("The editing instructions for the image generation"),
  seed: z
    .number()
    .int()
    .default(() => Math.floor(Math.random() * 1000000000000000))
    .describe("Seed for random number generation"),
  steps: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("Number of sampling steps"),
  cfg_scale: z
    .number()
    .min(0)
    .max(20)
    .default(2.5)
    .describe("Classifier-free guidance scale"),
  sampler_name: config.samplers
    .default("euler")
    .describe("Name of the sampler to use"),
  scheduler: config.schedulers
    .default("simple")
    .describe("Type of scheduler to use"),
  denoise: z.number().min(0).max(1).default(1).describe("Denoising strength"),
  model_name: z
    .string()
    .default("svdq-int4_r32-flux.1-kontext-dev.safetensors")
    .describe("Name of the Nunchaku FLUX DiT model to load"),
  clip_name_1: z
    .string()
    .default("clip_l.safetensors")
    .describe("Name of the first CLIP model for the DualCLIPLoader"),
  clip_name_2: z
    .string()
    .default("t5xxl_fp8_e4m3fn_scaled.safetensors")
    .describe("Name of the second CLIP model for the DualCLIPLoader"),
  vae_name: z
    .string()
    .default("ae.safetensors")
    .describe("Name of the VAE model to load"),
});

type InputType = z.infer<typeof RequestSchema>;

function generateWorkflow(input: InputType): ComfyPrompt {
  const workflow: ComfyPrompt = {
    "6": {
      inputs: {
        text: input.prompt,
        clip: ["38", 0],
      },
      class_type: "CLIPTextEncode",
    },
    "8": {
      inputs: {
        samples: ["31", 0],
        vae: ["39", 0],
      },
      class_type: "VAEDecode",
    },
    "31": {
      inputs: {
        seed: input.seed,
        steps: input.steps,
        cfg: 1,
        sampler_name: input.sampler_name,
        scheduler: input.scheduler,
        denoise: input.denoise,
        model: ["189", 0],
        positive: ["35", 0],
        negative: ["135", 0],
        latent_image: ["124", 0],
      },
      class_type: "KSampler",
    },
    "35": {
      inputs: {
        guidance: input.cfg_scale,
        conditioning: ["177", 0],
      },
      class_type: "FluxGuidance",
    },
    "38": {
      inputs: {
        clip_name1: input.clip_name_1,
        clip_name2: input.clip_name_2,
        type: "flux",
        device: "default",
      },
      class_type: "DualCLIPLoader",
    },
    "39": {
      inputs: {
        vae_name: input.vae_name,
      },
      class_type: "VAELoader",
    },
    "42": {
      inputs: {
        image: ["146", 0],
      },
      class_type: "FluxKontextImageScale",
    },
    "124": {
      inputs: {
        pixels: ["42", 0],
        vae: ["39", 0],
      },
      class_type: "VAEEncode",
    },
    "135": {
      inputs: {
        conditioning: ["6", 0],
      },
      class_type: "ConditioningZeroOut",
    },
    "136": {
      inputs: {
        filename_prefix: "ComfyUI",
        images: ["8", 0],
      },
      class_type: "SaveImage",
    },
    "142": {
      inputs: {
        image: input.image,
        "choose file to upload": "image",
      },
      class_type: "LoadImage",
    },
    "146": {
      inputs: {
        direction: "right",
        match_image_size: true,
        spacing_width: 0,
        spacing_color: "white",
        image1: ["142", 0],
      },
      class_type: "ImageStitch",
    },
    "177": {
      inputs: {
        conditioning: ["6", 0],
        latent: ["124", 0],
      },
      class_type: "ReferenceLatent",
    },
    "189": {
      inputs: {
        model_path: input.model_name,
        cache_threshold: 0,
        attention: "nunchaku-fp16",
        cpu_offload: "auto",
        device_id: 0,
        data_type: "bfloat16",
        i2f_mode: "enabled",
      },
      class_type: "NunchakuFluxDiTLoader",
    },
  };
  return workflow;
}

const workflow: Workflow = {
  RequestSchema,
  generateWorkflow,
  summary: "Flux Image to Image Edit",
  description:
    "Edits a provided image based on a text prompt using the Flux model via the Nunchaku loader. This workflow processes a single image for image-to-image transformation.",
};

export default workflow;
