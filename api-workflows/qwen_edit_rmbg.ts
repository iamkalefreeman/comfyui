import { z } from "zod";
// This gets evaluated in the context of src/workflows, so imports must be relative to that directory
import { ComfyPrompt, Workflow } from "../types";
import config from "../config";

const RequestSchema = z.object({
  image: z.string().describe("Input image for editing (URL or base64 encoded string)"),
  prompt: z
    .string()
    .default(
      "change background into tropical jungle with rocks, change scenery into tropical jungle with rocks, and apply soft background lens blur."
    )
    .describe("The editing instructions for the image generation"),
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
    .default(4)
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
    .default("Qwen-Image-Lightning-4steps-V2.0.safetensors")
    .describe("Name of the LoRA model to use"),
  lora_1_strength: z
    .number()
    .optional()
    .default(1)
    .describe("Strength of the LoRA model"),
  lora_2_name: z
    .string()
    .optional()
    .default("None")
    .describe("Name of the LoRA model to use"),
  lora_2_strength: z
    .number()
    .optional()
    .default(1)
    .describe("Strength of the LoRA model"),
  lora_3_name: z
    .string()
    .optional()
    .default("None")
    .describe("Name of the LoRA model to use"),
  lora_3_strength: z
    .number()
    .optional()
    .default(1)
    .describe("Strength of the LoRA model"),
  lora_4_name: z
    .string()
    .optional()
    .default("None")
    .describe("Name of the LoRA model to use"),
  lora_4_strength: z
    .number()
    .optional()
    .default(1)
    .describe("Strength of the LoRA model"),
  lora_5_name: z
    .string()
    .optional()
    .default("None")
    .describe("Name of the LoRA model to use"),
  lora_5_strength: z
    .number()
    .optional()
    .default(1)
    .describe("Strength of the LoRA model"),
  lora_6_name: z
    .string()
    .optional()
    .default("None")
    .describe("Name of the LoRA model to use"),
  lora_6_strength: z
    .number()
    .optional()
    .default(1)
    .describe("Strength of the LoRA model"),
  lora_7_name: z
    .string()
    .optional()
    .default("None")
    .describe("Name of the LoRA model to use"),
  lora_7_strength: z
    .number()
    .optional()
    .default(1)
    .describe("Strength of the LoRA model"),
  lora_8_name: z
    .string()
    .optional()
    .default("None")
    .describe("Name of the LoRA model to use"),
  lora_8_strength: z
    .number()
    .optional()
    .default(1)
    .describe("Strength of the LoRA model"),
  lora_9_name: z
    .string()
    .optional()
    .default("None")
    .describe("Name of the LoRA model to use"),
  lora_9_strength: z
    .number()
    .optional()
    .default(1)
    .describe("Strength of the LoRA model"),
  lora_10_name: z
    .string()
    .optional()
    .default("None")
    .describe("Name of the LoRA model to use"),
  lora_10_strength: z
    .number()
    .optional()
    .default(1)
    .describe("Strength of the LoRA model"),
  unet_name: z
    .string()
    .optional()
    .default("qwen_image_edit_2509_fp8_e4m3fn.safetensors")
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
  rmbg_model: z
    .string()
    .optional()
    .default("RMBG-2.0")
    .describe("Model to use for background removal"),
  rmbg_sensitivity: z
    .number()
    .optional()
    .default(1)
    .describe("Sensitivity for the background removal model"),
  rmbg_process_res: z
    .number()
    .int()
    .optional()
    .default(1024)
    .describe("Processing resolution for background removal"),
  rmbg_mask_blur: z
    .number()
    .int()
    .optional()
    .default(0)
    .describe("Blur radius for the background mask"),
  rmbg_mask_offset: z
    .number()
    .int()
    .optional()
    .default(0)
    .describe("Offset for the background mask"),
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
        positive: ["111", 0],
        negative: ["116", 0],
        latent_image: ["127", 0],
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
        model: ["117", 0],
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
        pixels: ["123", 0],
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
    "111": {
      inputs: {
        prompt: input.prompt,
        clip: ["117", 1],
        vae: ["39", 0],
        image1: ["93", 0],
      },
      class_type: "TextEncodeQwenImageEditPlus",
      _meta: {
        title: "TextEncodeQwenImageEditPlus",
      },
    },
    "116": {
      inputs: {
        conditioning: ["111", 0],
      },
      class_type: "ConditioningZeroOut",
      _meta: {
        title: "ConditioningZeroOut",
      },
    },
    "117": {
      inputs: {
        lora_01: input.lora_1_name,
        strength_01: input.lora_1_strength,
        lora_02: input.lora_2_name,
        strength_02: input.lora_2_strength,
        lora_03: input.lora_3_name,
        strength_03: input.lora_3_strength,
        lora_04: input.lora_4_name,
        strength_04: input.lora_4_strength,
        lora_05: input.lora_5_name,
        strength_05: input.lora_5_strength,
        lora_06: input.lora_6_name,
        strength_06: input.lora_6_strength,
        lora_07: input.lora_7_name,
        strength_07: input.lora_7_strength,
        lora_08: input.lora_8_name,
        strength_08: input.lora_8_strength,
        lora_09: input.lora_9_name,
        strength_09: input.lora_9_strength,
        lora_10: input.lora_10_name,
        strength_10: input.lora_10_strength,
        model: ["37", 0],
        clip: ["38", 0],
      },
      class_type: "TooManyLoras",
      _meta: {
        title: "TooManyLoras",
      },
    },
    "118": {
      inputs: {
        seed: (input.seed ?? 0) + 1,
        steps: input.steps,
        cfg: input.cfg_scale,
        sampler_name: input.sampler_name,
        scheduler: input.scheduler,
        denoise: input.denoise,
        model: ["75", 0],
        positive: ["128", 0],
        negative: ["129", 0],
        latent_image: ["88", 0],
      },
      class_type: "KSampler",
      _meta: {
        title: "KSampler",
      },
    },
    "119": {
      inputs: {
        samples: ["118", 0],
        vae: ["39", 0],
      },
      class_type: "VAEDecode",
      _meta: {
        title: "VAE Decode",
      },
    },
    "120": {
      inputs: {
        filename_prefix: "ComfyUI",
        images: ["119", 0],
      },
      class_type: "SaveImage",
      _meta: {
        title: "Save Image",
      },
    },
    "123": {
      inputs: {
        model: input.rmbg_model,
        sensitivity: input.rmbg_sensitivity,
        process_res: input.rmbg_process_res,
        mask_blur: input.rmbg_mask_blur,
        mask_offset: input.rmbg_mask_offset,
        invert_output: false,
        refine_foreground: false,
        background: "Alpha",
        background_color: "#ffffff",
        image: ["93", 0],
      },
      class_type: "RMBG",
      _meta: {
        title: "Remove Background (RMBG)",
      },
    },
    "127": {
      inputs: {
        pixels: ["93", 0],
        vae: ["39", 0],
      },
      class_type: "VAEEncode",
      _meta: {
        title: "VAE Encode",
      },
    },
    "128": {
      inputs: {
        prompt: input.prompt,
        clip: ["117", 1],
        vae: ["39", 0],
        image1: ["152", 0],
      },
      class_type: "TextEncodeQwenImageEditPlus",
      _meta: {
        title: "TextEncodeQwenImageEditPlus",
      },
    },
    "129": {
      inputs: {
        conditioning: ["128", 0],
      },
      class_type: "ConditioningZeroOut",
      _meta: {
        title: "ConditioningZeroOut",
      },
    },
    "132": {
      inputs: {
        filename_prefix: "ComfyUI",
        images: ["123", 0],
      },
      class_type: "SaveImage",
      _meta: {
        title: "Save Image",
      },
    },
    "148": {
      inputs: {
        width: ["151", 0],
        height: ["151", 1],
        batch_size: 1,
        color: 16777215,
      },
      class_type: "EmptyImage",
      _meta: {
        title: "EmptyImage",
      },
    },
    "151": {
      inputs: {
        image: ["93", 0],
      },
      class_type: "GetImageSize+",
      _meta: {
        title: "🔧 Get Image Size",
      },
    },
    "152": {
      inputs: {
        x: 0,
        y: 0,
        resize_source: false,
        destination: ["148", 0],
        source: ["123", 0],
        mask: ["123", 1],
      },
      class_type: "ImageCompositeMasked",
      _meta: {
        title: "ImageCompositeMasked",
      },
    },
  };
}

const workflow: Workflow = {
  RequestSchema,
  generateWorkflow,
  summary: "Qwen Image Edit with Background Removal",
  description:
    "Edits a provided image based on a text prompt using the Qwen model. This workflow performs two passes: one on the original image and a second on the image with its background removed, generating multiple output images.",
};

export default workflow;
