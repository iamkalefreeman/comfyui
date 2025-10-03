import { z } from "zod";
// This gets evaluated in the context of src/workflows, so imports must be relative to that directory
import { ComfyPrompt, Workflow } from "../types";
import config from "../config";

const RequestSchema = z.object({
  image: z
    .string()
    .describe("Input image to be edited (URL or base64 encoded string)"),
  prompt: z
    .string()
    .default(
      "transform to 3d style\n===\ntransform to 3d style\n===\nreplace background to beach scene. <restoreface>"
    )
    .describe(
      "The editing instructions for the image. Use '===' to separate prompts for different stages. Use <restoreface> to enable face restoration."
    ),
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
    .default(1)
    .describe("Classifier-free guidance scale"),
  sampler_name: config.samplers
    .default("euler")
    .describe("Name of the sampler to use"),
  scheduler: config.schedulers
    .default("simple")
    .describe("Type of scheduler to use"),
  denoise: z
    .number()
    .min(0)
    .max(1)
    .default(1)
    .describe("Denoising strength"),
  guidance: z
    .number()
    .default(2.5)
    .describe("Guidance strength for the Flux model"),
  unet_name: z
    .string()
    .default("flux1-dev-kontext_fp8_scaled.safetensors")
    .describe("Name of the UNET model to load"),
  clip_name1: z
    .string()
    .default("clip_l.safetensors")
    .describe("Name of the first CLIP model to load"),
  clip_name2: z
    .string()
    .default("t5xxl_fp8_e4m3fn_scaled.safetensors")
    .describe("Name of the second CLIP model to load"),
  vae_name: z
    .string()
    .default("ae.safetensors")
    .describe("Name of the VAE model to load"),
  face_detection_model: z
    .string()
    .default("retinaface_resnet50")
    .describe("Model to use for face detection in face restoration"),
  face_restore_model: z
    .string()
    .default("codeformer.pth")
    .describe("Model to use for face restoration"),
  face_restore_visibility: z
    .number()
    .min(0)
    .max(1)
    .default(1)
    .describe("Visibility of the restored face"),
  face_restore_take_count: z
    .number()
    .int()
    .default(10)
    .describe("Maximum number of faces to restore"),
  codeformer_weight: z
    .number()
    .min(0)
    .max(1)
    .default(0.5)
    .describe("Weight of the CodeFormer model in face restoration"),
  lora_1_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_1_strength: z.number().default(1).describe("Strength of the LoRA model"),
  lora_2_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_2_strength: z.number().default(1).describe("Strength of the LoRA model"),
  lora_3_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_3_strength: z.number().default(1).describe("Strength of the LoRA model"),
  lora_4_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_4_strength: z.number().default(1).describe("Strength of the LoRA model"),
  lora_5_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_5_strength: z.number().default(1).describe("Strength of the LoRA model"),
  lora_6_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_6_strength: z.number().default(1).describe("Strength of the LoRA model"),
  lora_7_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_7_strength: z.number().default(1).describe("Strength of the LoRA model"),
  lora_8_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_8_strength: z.number().default(1).describe("Strength of the LoRA model"),
  lora_9_name: z.string().default("None").describe("Name of the LoRA model to use"),
  lora_9_strength: z.number().default(1).describe("Strength of the LoRA model"),
  lora_10_name: z
    .string()
    .default("None")
    .describe("Name of the LoRA model to use"),
  lora_10_strength: z.number().default(1).describe("Strength of the LoRA model"),
});

type InputType = z.infer<typeof RequestSchema>;

function generateWorkflow(input: InputType): ComfyPrompt {
  const workflow: ComfyPrompt = {
    "6": {
      inputs: {
        text: ["194", 0],
        clip: ["190", 1],
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
        steps: input.steps,
        cfg: input.cfg_scale,
        sampler_name: input.sampler_name,
        scheduler: input.scheduler,
        denoise: input.denoise,
        model: ["190", 0],
        positive: ["35", 0],
        negative: ["135", 0],
        latent_image: ["124", 0],
        seed: ["197", 3],
      },
      class_type: "KSampler",
    },
    "35": {
      inputs: {
        guidance: input.guidance,
        conditioning: ["177", 0],
      },
      class_type: "FluxGuidance",
    },
    "37": {
      inputs: {
        unet_name: input.unet_name,
        weight_dtype: "default",
      },
      class_type: "UNETLoader",
    },
    "38": {
      inputs: {
        clip_name1: input.clip_name1,
        clip_name2: input.clip_name2,
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
        images: ["200", 0],
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
    "190": {
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
    },
    "191": {
      inputs: {
        text: input.prompt,
      },
      class_type: "Text Multiline",
    },
    "192": {
      inputs: {
        delimiter: "===",
        start_index: 0,
        skip_every: 0,
        max_count: 8,
        text: ["191", 0],
      },
      class_type: "TextSplitByDelimiter",
    },
    "193": {
      inputs: {
        regex_pattern: "[\r\n]",
        replace: "",
        case_insensitive: true,
        multiline: false,
        dotall: false,
        count: 0,
        string: ["195", 0],
      },
      class_type: "RegexReplace",
    },
    "194": {
      inputs: {
        regex_pattern: "\\<.*\\>",
        replace: "",
        case_insensitive: true,
        multiline: false,
        dotall: false,
        count: 0,
        string: ["193", 0],
      },
      class_type: "RegexReplace",
    },
    "195": {
      inputs: {
        version: 1,
        prompt: ["192", 0],
        seed: ["197", 3],
      },
      class_type: "Stable Wildcards",
    },
    "197": {
      inputs: {
        seed: input.seed,
      },
      class_type: "Seed",
    },
    "200": {
      inputs: {
        cond: ["201", 0],
        tt_value: ["202", 0],
        ff_value: ["8", 0],
      },
      class_type: "ImpactConditionalBranch",
    },
    "201": {
      inputs: {
        sub_text: "<restoreface>",
        case_insensitive: true,
        text: ["193", 0],
      },
      class_type: "Text Contains",
    },
    "202": {
      inputs: {
        facedetection: input.face_detection_model,
        model: input.face_restore_model,
        visibility: input.face_restore_visibility,
        codeformer_weight: input.codeformer_weight,
        face_selection: "all",
        sort_by: "area",
        reverse_order: false,
        take_start: 0,
        take_count: input.face_restore_take_count,
        image: ["8", 0],
      },
      class_type: "ReActorRestoreFaceAdvanced",
    },
  };
  return workflow;
}

const workflow: Workflow = {
  RequestSchema,
  generateWorkflow,
  summary: "Flux Image Editing",
  description:
    "Edits a provided image based on a text prompt using the Flux model. The workflow supports conditional face restoration by including the tag <restoreface> in the prompt. It also supports wildcard replacements in the prompt (e.g., {option1|option2}).",
};

export default workflow;
