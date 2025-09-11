import { z } from "zod";
// This gets evaluated in the context of src/workflows, so imports must be relative to that directory
import { ComfyPrompt, Workflow } from "../types";
import config from "../config";

const RequestSchema = z.object({
  image: z.string().describe("The input image to be edited, provided as a URL or base64 encoded string."),
  prompt: z.string().describe("The positive prompt describing the desired edit."),
  negative_prompt: z
    .string()
    .optional()
    .default("blurry, ugly")
    .describe("The negative prompt to guide the generation away from."),
  seed: z
    .number()
    .int()
    .optional()
    .default(() => Math.floor(Math.random() * 1000000000000000))
    .describe("Seed for random number generation. A specific seed will ensure reproducible results."),
  steps: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(4)
    .describe("Number of sampling steps."),
  cfg_scale: z
    .number()
    .min(0)
    .max(20)
    .optional()
    .default(1)
    .describe("Classifier-Free Guidance scale."),
  sampler_name: config.samplers
    .optional()
    .default("euler")
    .describe("The sampler to use for the generation process."),
  scheduler: config.schedulers
    .optional()
    .default("simple")
    .describe("The scheduler to use for the generation process."),
  denoise: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .default(1)
    .describe("Denoising strength. A value of 1.0 completely replaces the original image content based on the prompt."),
  megapixels: z
    .number()
    .min(0.1)
    .max(4)
    .optional()
    .default(1)
    .describe("The target resolution for the input image in megapixels before processing."),
  aura_flow_shift: z
    .number()
    .int()
    .optional()
    .default(3)
    .describe("Shift value for the ModelSamplingAuraFlow node."),
  cfg_norm_strength: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .default(0.79)
    .describe("Strength of the CFGNorm normalization."),
  unet_name: config.unets.optional().default("qwen_image_edit_fp8_e4m3fn.safetensors").describe("The UNET model to use."),
  clip_name: config.clips.optional().default("qwen_2.5_vl_7b_fp8_scaled.safetensors").describe("The CLIP model to use."),
  vae_name: config.vaes.optional().default("qwen_image_vae.safetensors").describe("The VAE model to use."),
  lora_1_name: z
    .string()
    .optional()
    .default("Qwen-Image-Lightning-4steps-V1.0.safetensors")
    .describe("Name of the first LoRA model to use (e.g., Lightning)"),
  lora_1_strength: z
    .number()
    .optional()
    .default(1)
    .describe("Strength of the first LoRA model"),
  lora_2_name: z
    .string()
    .optional()
    .default("extractOutfitV3.xWyV.safetensors")
    .describe("Name of the second LoRA model to use (e.g., Outfit Extractor)"),
  lora_2_strength: z
    .number()
    .optional()
    .default(1)
    .describe("Strength of the second LoRA model"),
  lora_3_name: z
    .string()
    .optional()
    .default("qwenRealNud3s.r69Z.safetensors")
    .describe("Name of the third LoRA model to use (e.g., RealNud3)"),
  lora_3_strength: z
    .number()
    .optional()
    .default(1)
    .describe("Strength of the third LoRA model"),
});

type InputType = z.infer<typeof RequestSchema>;

function generateWorkflow(input: InputType): ComfyPrompt {
  return {
    "3": {
      inputs: {
        seed: input.seed,
        steps: input.steps,
        cfg: input.cfg_scale,
        sampler_name: input.sampler_name,
        scheduler: input.scheduler,
        denoise: input.denoise,
        model: ["75", 0],
        positive: ["76", 0],
        negative: ["77", 0],
        latent_image: ["88", 0],
      },
      class_type: "KSampler",
      _meta: {
        title: "KSampler",
      },
    },
    "8": {
      inputs: {
        samples: ["3", 0],
        vae: ["39", 0],
      },
      class_type: "VAEDecode",
      _meta: {
        title: "VAE Decode",
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
        clip_name: input.clip_name,
        type: "qwen_image",
        device: "default",
      },
      class_type: "CLIPLoader",
      _meta: {
        title: "Load CLIP",
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
    "60": {
      inputs: {
        filename_prefix: "ComfyUI",
        images: ["8", 0],
      },
      class_type: "SaveImage",
      _meta: {
        title: "Save Image",
      },
    },
    "66": {
      inputs: {
        shift: input.aura_flow_shift,
        model: ["109", 0],
      },
      class_type: "ModelSamplingAuraFlow",
      _meta: {
        title: "ModelSamplingAuraFlow",
      },
    },
    "75": {
      inputs: {
        strength: input.cfg_norm_strength,
        model: ["66", 0],
      },
      class_type: "CFGNorm",
      _meta: {
        title: "CFGNorm",
      },
    },
    "76": {
      inputs: {
        prompt: input.prompt,
        clip: ["38", 0],
        vae: ["39", 0],
        image: ["93", 0],
      },
      class_type: "TextEncodeQwenImageEdit",
      _meta: {
        title: "TextEncodeQwenImageEdit",
      },
    },
    "77": {
      inputs: {
        prompt: input.negative_prompt,
        clip: ["38", 0],
        vae: ["39", 0],
        image: ["93", 0],
      },
      class_type: "TextEncodeQwenImageEdit",
      _meta: {
        title: "TextEncodeQwenImageEdit",
      },
    },
    "78": {
      inputs: {
        image: input.image,
        upload: "image",
      },
      class_type: "LoadImage",
      _meta: {
        title: "Load Image",
      },
    },
    "88": {
      inputs: {
        pixels: ["93", 0],
        vae: ["39", 0],
      },
      class_type: "VAEEncode",
      _meta: {
        title: "VAE Encode",
      },
    },
    "93": {
      inputs: {
        upscale_method: "lanczos",
        megapixels: input.megapixels,
        image: ["78", 0],
      },
      class_type: "ImageScaleToTotalPixels",
      _meta: {
        title: "Scale Image to Total Pixels",
      },
    },
    "101": {
      inputs: {
        lora_name: input.lora_1_name,
        strength_model: input.lora_1_strength,
        model: ["37", 0],
      },
      class_type: "LoraLoaderModelOnly",
      _meta: {
        title: "LoraLoaderModelOnly",
      },
    },
    "102": {
      inputs: {
        lora_name: input.lora_2_name,
        strength_model: input.lora_2_strength,
        model: ["101", 0],
      },
      class_type: "LoraLoaderModelOnly",
      _meta: {
        title: "LoraLoaderModelOnly",
      },
    },
    "103": {
      inputs: {
        seed: input.seed + 1,
        steps: input.steps,
        cfg: input.cfg_scale,
        sampler_name: input.sampler_name,
        scheduler: input.scheduler,
        denoise: input.denoise,
        model: ["75", 0],
        positive: ["76", 0],
        negative: ["77", 0],
        latent_image: ["88", 0],
      },
      class_type: "KSampler",
      _meta: {
        title: "KSampler",
      },
    },
    "104": {
      inputs: {
        samples: ["103", 0],
        vae: ["39", 0],
      },
      class_type: "VAEDecode",
      _meta: {
        title: "VAE Decode",
      },
    },
    "105": {
      inputs: {
        filename_prefix: "ComfyUI",
        images: ["104", 0],
      },
      class_type: "SaveImage",
      _meta: {
        title: "Save Image",
      },
    },
    "106": {
      inputs: {
        seed: input.seed + 2,
        steps: input.steps,
        cfg: input.cfg_scale,
        sampler_name: input.sampler_name,
        scheduler: input.scheduler,
        denoise: input.denoise,
        model: ["75", 0],
        positive: ["76", 0],
        negative: ["77", 0],
        latent_image: ["88", 0],
      },
      class_type: "KSampler",
      _meta: {
        title: "KSampler",
      },
    },
    "107": {
      inputs: {
        samples: ["106", 0],
        vae: ["39", 0],
      },
      class_type: "VAEDecode",
      _meta: {
        title: "VAE Decode",
      },
    },
    "108": {
      inputs: {
        filename_prefix: "ComfyUI",
        images: ["107", 0],
      },
      class_type: "SaveImage",
      _meta: {
        title: "Save Image",
      },
    },
    "109": {
      inputs: {
        lora_name: input.lora_3_name,
        strength_model: input.lora_3_strength,
        model: ["102", 0],
      },
      class_type: "LoraLoaderModelOnly",
      _meta: {
        title: "LoraLoaderModelOnly",
      },
    },
  };
}

const workflow: Workflow = {
  RequestSchema,
  generateWorkflow,
  summary: "Qwen Text-Guided Image Editing (3 LoRA)",
  description: "Edits an input image based on a text prompt using the Qwen-Image model with a three-LoRA chain. This workflow generates 3 variations.",
};

export default workflow;
