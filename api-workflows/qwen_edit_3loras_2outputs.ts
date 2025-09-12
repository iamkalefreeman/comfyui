import { z } from "zod";
// This gets evaluated in the context of src/workflows, so imports must be relative to that directory
import { ComfyPrompt, Workflow } from "../types";
import config from "../config";

const RequestSchema = z.object({
  image: z.string().describe("Input image for editing (URL or base64 encoded string)"),
  prompt: z
    .string()
    .default("Replace background with tropical forest with rocks")
    .describe("The editing instructions for the image generation"),
  negative_prompt: z
    .string()
    .optional()
    .default("")
    .describe("The negative prompt for the image generation"),
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
    .default(5)
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
  aura_flow_shift: z
    .number()
    .int()
    .optional()
    .default(3)
    .describe("Aura Flow model sampling shift value"),
  cfg_norm_strength: z
    .number()
    .optional()
    .default(1)
    .describe("Strength for CFG Normalization"),
  upscale_method: z
    .string()
    .optional()
    .default("lanczos")
    .describe("Method to use for upscaling the image"),
  megapixels: z
    .number()
    .optional()
    .default(1)
    .describe("Total megapixels to scale the image to"),
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
  unet_name: z
    .string()
    .optional()
    .default("qwen_image_edit_fp8_e4m3fn.safetensors")
    .describe("Name of the UNET model to load"),
  clip_name: z
    .string()
    .optional()
    .default("qwen_2.5_vl_7b_fp8_scaled.safetensors")
    .describe("Name of the CLIP model to load"),
  vae_name: z
    .string()
    .optional()
    .default("qwen_image_vae.safetensors")
    .describe("Name of the VAE model to load"),
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
        upscale_method: input.upscale_method,
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
