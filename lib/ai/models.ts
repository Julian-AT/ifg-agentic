export const DEFAULT_CHAT_MODEL: string = "google/gemini-2.5-pro";

export interface ChatModel {
  model: string;
  context: string;
  modelImage: string;
  modelLink: string;
  pricing: {
    input: string;
    output: string;
    cachedInput: string;
    cachedOutput: string;
  };
  providers: {
    provider: string;
    icon: string;
  }[];
}

export const chatModels: Array<ChatModel> = [
  {
    "model": "anthropic/claude-haiku-4.5",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/claude-haiku-4.5",
    "context": "200K",
    "pricing": {
      "input": "$1.00/M",
      "output": "$5.00/M",
      "cachedInput": "$0.10/M",
      "cachedOutput": "$1.25/M"
    },
    "providers": [
      {
        "provider": "anthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=48&q=75"
      },
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      },
      {
        "provider": "vertexAnthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvertex%20ai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "anthropic/claude-sonnet-4.5",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/claude-sonnet-4.5",
    "context": "200K",
    "pricing": {
      "input": "$3.00/M",
      "output": "$15.00/M",
      "cachedInput": "$0.30/M",
      "cachedOutput": "$3.75/M"
    },
    "providers": [
      {
        "provider": "anthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=48&q=75"
      },
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      },
      {
        "provider": "vertexAnthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvertex%20ai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "google/gemini-2.5-pro",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgoogle.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gemini-2.5-pro",
    "context": "1M",
    "pricing": {
      "input": "$0.63/M",
      "output": "$5.00/M",
      "cachedInput": "$0.13/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "google",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgoogle.png&w=48&q=75"
      },
      {
        "provider": "vertex",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvertex%20ai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/gpt-4.1-mini",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gpt-4.1-mini",
    "context": "1M",
    "pricing": {
      "input": "$0.40/M",
      "output": "$1.60/M",
      "cachedInput": "$0.10/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "azure",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fazure.png&w=48&q=75"
      },
      {
        "provider": "openai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/gpt-5-nano",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gpt-5-nano",
    "context": "400K",
    "pricing": {
      "input": "$0.05/M",
      "output": "$0.40/M",
      "cachedInput": "$0.01/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "azure",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fazure.png&w=48&q=75"
      },
      {
        "provider": "openai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "anthropic/claude-sonnet-4",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/claude-sonnet-4",
    "context": "200K",
    "pricing": {
      "input": "$3.00/M",
      "output": "$15.00/M",
      "cachedInput": "$0.30/M",
      "cachedOutput": "$3.75/M"
    },
    "providers": [
      {
        "provider": "anthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=48&q=75"
      },
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      },
      {
        "provider": "vertexAnthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvertex%20ai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "google/gemini-2.5-flash",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgoogle.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gemini-2.5-flash",
    "context": "1M",
    "pricing": {
      "input": "$0.30/M",
      "output": "$2.50/M",
      "cachedInput": "$0.03/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "google",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgoogle.png&w=48&q=75"
      },
      {
        "provider": "vertex",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvertex%20ai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/gpt-5",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gpt-5",
    "context": "400K",
    "pricing": {
      "input": "$1.25/M",
      "output": "$10.00/M",
      "cachedInput": "$0.13/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "azure",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fazure.png&w=48&q=75"
      },
      {
        "provider": "openai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "anthropic/claude-3-haiku",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/claude-3-haiku",
    "context": "200K",
    "pricing": {
      "input": "$0.25/M",
      "output": "$1.25/M",
      "cachedInput": "$0.03/M",
      "cachedOutput": "$0.30/M"
    },
    "providers": [
      {
        "provider": "anthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=48&q=75"
      },
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      },
      {
        "provider": "vertexAnthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvertex%20ai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "google/gemini-2.0-flash",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgoogle.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gemini-2.0-flash",
    "context": "1M",
    "pricing": {
      "input": "$0.10/M",
      "output": "$0.40/M",
      "cachedInput": "$0.03/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "google",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgoogle.png&w=48&q=75"
      },
      {
        "provider": "vertex",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvertex%20ai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/gpt-5-mini",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gpt-5-mini",
    "context": "400K",
    "pricing": {
      "input": "$0.25/M",
      "output": "$2.00/M",
      "cachedInput": "$0.03/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "azure",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fazure.png&w=48&q=75"
      },
      {
        "provider": "openai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/gpt-5-codex",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gpt-5-codex",
    "context": "400K",
    "pricing": {
      "input": "$1.25/M",
      "output": "$10.00/M",
      "cachedInput": "$0.13/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "azure",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fazure.png&w=48&q=75"
      },
      {
        "provider": "openai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "google/gemini-2.0-flash-lite",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgoogle.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gemini-2.0-flash-lite",
    "context": "1M",
    "pricing": {
      "input": "$0.07/M",
      "output": "$0.30/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "google",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgoogle.png&w=48&q=75"
      },
      {
        "provider": "vertex",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvertex%20ai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/gpt-oss-120b",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gpt-oss-120b",
    "context": "131K",
    "pricing": {
      "input": "$0.10/M",
      "output": "$0.50/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "baseten",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fbaseten.png&w=48&q=75"
      },
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      },
      {
        "provider": "cerebras",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fcerebras.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "google/gemini-2.5-flash-lite",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgoogle.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gemini-2.5-flash-lite",
    "context": "1M",
    "pricing": {
      "input": "$0.10/M",
      "output": "$0.40/M",
      "cachedInput": "$0.01/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "google",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgoogle.png&w=48&q=75"
      },
      {
        "provider": "vertex",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvertex%20ai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/gpt-4o-mini",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gpt-4o-mini",
    "context": "128K",
    "pricing": {
      "input": "$0.15/M",
      "output": "$0.60/M",
      "cachedInput": "$0.07/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "azure",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fazure.png&w=48&q=75"
      },
      {
        "provider": "openai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "anthropic/claude-3.7-sonnet",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/claude-3.7-sonnet",
    "context": "200K",
    "pricing": {
      "input": "$3.00/M",
      "output": "$15.00/M",
      "cachedInput": "$0.30/M",
      "cachedOutput": "$3.75/M"
    },
    "providers": [
      {
        "provider": "anthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=48&q=75"
      },
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      },
      {
        "provider": "vertexAnthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvertex%20ai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "xai/grok-4-fast-non-reasoning",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/grok-4-fast-non-reasoning",
    "context": "2M",
    "pricing": {
      "input": "$0.20/M",
      "output": "$0.50/M",
      "cachedInput": "$0.05/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "xai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "xai/grok-4-fast-reasoning",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/grok-4-fast-reasoning",
    "context": "2M",
    "pricing": {
      "input": "$0.20/M",
      "output": "$0.50/M",
      "cachedInput": "$0.05/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "xai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/gpt-4.1",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gpt-4.1",
    "context": "1M",
    "pricing": {
      "input": "$2.00/M",
      "output": "$8.00/M",
      "cachedInput": "$0.50/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "azure",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fazure.png&w=48&q=75"
      },
      {
        "provider": "openai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/gpt-4o",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gpt-4o",
    "context": "128K",
    "pricing": {
      "input": "$2.50/M",
      "output": "$10.00/M",
      "cachedInput": "$1.25/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "azure",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fazure.png&w=48&q=75"
      },
      {
        "provider": "openai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "zai/glm-4.6",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fzai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/glm-4.6",
    "context": "200K",
    "pricing": {
      "input": "$0.45/M",
      "output": "$1.80/M",
      "cachedInput": "$0.11/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "zai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fzai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "minimax/minimax-m2",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fminimax.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/minimax-m2",
    "context": "205K",
    "pricing": {
      "input": "$0.00/M",
      "output": "$0.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "minimax",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fminimax.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "alibaba/qwen-3-235b",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/qwen-3-235b",
    "context": "262K",
    "pricing": {
      "input": "$0.13/M",
      "output": "$0.60/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "baseten",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fbaseten.png&w=48&q=75"
      },
      {
        "provider": "deepinfra",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fdeepinfra.png&w=48&q=75"
      },
      {
        "provider": "fireworks",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Ffireworks.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "alibaba/qwen3-max",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/qwen3-max",
    "context": "262K",
    "pricing": {
      "input": "$1.20/M",
      "output": "$6.00/M",
      "cachedInput": "$0.24/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "alibaba",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "mistral/ministral-3b",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/ministral-3b",
    "context": "128K",
    "pricing": {
      "input": "$0.04/M",
      "output": "$0.04/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "mistral",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "deepseek/deepseek-v3.2-exp",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fdeepseek.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/deepseek-v3.2-exp",
    "context": "164K",
    "pricing": {
      "input": "$0.27/M",
      "output": "$0.41/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "deepseek",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fdeepseek.png&w=48&q=75"
      },
      {
        "provider": "novita",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fnovita.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "google/gemini-2.5-flash-preview-09-2025",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgoogle.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gemini-2.5-flash-preview-09-2025",
    "context": "1M",
    "pricing": {
      "input": "$0.30/M",
      "output": "$2.50/M",
      "cachedInput": "$0.03/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "google",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgoogle.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "xai/grok-4",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/grok-4",
    "context": "256K",
    "pricing": {
      "input": "$3.00/M",
      "output": "$15.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "xai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "amazon/nova-lite",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/nova-lite",
    "context": "300K",
    "pricing": {
      "input": "$0.06/M",
      "output": "$0.24/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "deepseek/deepseek-v3.1",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fdeepseek.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/deepseek-v3.1",
    "context": "164K",
    "pricing": {
      "input": "$0.30/M",
      "output": "$1.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "baseten",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fbaseten.png&w=48&q=75"
      },
      {
        "provider": "deepinfra",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fdeepinfra.png&w=48&q=75"
      },
      {
        "provider": "fireworks",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Ffireworks.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "xai/grok-code-fast-1",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/grok-code-fast-1",
    "context": "256K",
    "pricing": {
      "input": "$0.20/M",
      "output": "$1.50/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "xai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "moonshotai/kimi-k2",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmoonshotai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/kimi-k2",
    "context": "131K",
    "pricing": {
      "input": "$0.50/M",
      "output": "$2.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "deepinfra",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fdeepinfra.png&w=48&q=75"
      },
      {
        "provider": "fireworks",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Ffireworks.png&w=48&q=75"
      },
      {
        "provider": "groq",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgroq.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "google/gemini-2.5-flash-image-preview",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgoogle.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gemini-2.5-flash-image-preview",
    "context": "33K",
    "pricing": {
      "input": "$0.30/M",
      "output": "$2.50/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "google",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgoogle.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "deepseek/deepseek-v3",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fdeepseek.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/deepseek-v3",
    "context": "164K",
    "pricing": {
      "input": "$0.77/M",
      "output": "$0.77/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "baseten",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fbaseten.png&w=48&q=75"
      },
      {
        "provider": "novita",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fnovita.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "deepseek/deepseek-v3.2-exp-thinking",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fdeepseek.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/deepseek-v3.2-exp-thinking",
    "context": "164K",
    "pricing": {
      "input": "$0.28/M",
      "output": "$0.42/M",
      "cachedInput": "$0.03/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "deepseek",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fdeepseek.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/o3",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/o3",
    "context": "200K",
    "pricing": {
      "input": "$2.00/M",
      "output": "$8.00/M",
      "cachedInput": "$0.50/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "openai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "google/gemini-2.5-flash-lite-preview-09-2025",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgoogle.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gemini-2.5-flash-lite-preview-09-2025",
    "context": "1M",
    "pricing": {
      "input": "$0.10/M",
      "output": "$0.40/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "google",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgoogle.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "moonshotai/kimi-k2-0905",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmoonshotai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/kimi-k2-0905",
    "context": "131K",
    "pricing": {
      "input": "$0.60/M",
      "output": "$2.50/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "baseten",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fbaseten.png&w=48&q=75"
      },
      {
        "provider": "fireworks",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Ffireworks.png&w=48&q=75"
      },
      {
        "provider": "groq",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgroq.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "anthropic/claude-opus-4.1",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/claude-opus-4.1",
    "context": "200K",
    "pricing": {
      "input": "$15.00/M",
      "output": "$75.00/M",
      "cachedInput": "$1.50/M",
      "cachedOutput": "$18.75/M"
    },
    "providers": [
      {
        "provider": "anthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=48&q=75"
      },
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      },
      {
        "provider": "vertexAnthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvertex%20ai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "meta/llama-4-maverick",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmeta.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/llama-4-maverick",
    "context": "1.3M",
    "pricing": {
      "input": "$0.15/M",
      "output": "$0.60/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      },
      {
        "provider": "deepinfra",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fdeepinfra.png&w=48&q=75"
      },
      {
        "provider": "vertex",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvertex%20ai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "alibaba/qwen3-coder",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/qwen3-coder",
    "context": "131K",
    "pricing": {
      "input": "$0.40/M",
      "output": "$1.60/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "baseten",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fbaseten.png&w=48&q=75"
      },
      {
        "provider": "cerebras",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fcerebras.png&w=48&q=75"
      },
      {
        "provider": "deepinfra",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fdeepinfra.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "perplexity/sonar",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fperplexity.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/sonar",
    "context": "127K",
    "pricing": {
      "input": "$1.00/M",
      "output": "$1.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "perplexity",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fperplexity.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "google/gemini-2.5-flash-image",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgoogle.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gemini-2.5-flash-image",
    "context": "33K",
    "pricing": {
      "input": "$0.30/M",
      "output": "$2.50/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "google",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgoogle.png&w=48&q=75"
      },
      {
        "provider": "vertex",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvertex%20ai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/gpt-4.1-nano",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gpt-4.1-nano",
    "context": "1M",
    "pricing": {
      "input": "$0.10/M",
      "output": "$0.40/M",
      "cachedInput": "$0.03/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "azure",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fazure.png&w=48&q=75"
      },
      {
        "provider": "openai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "xai/grok-3-mini",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/grok-3-mini",
    "context": "131K",
    "pricing": {
      "input": "$0.30/M",
      "output": "$0.50/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "xai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "anthropic/claude-3.5-haiku",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/claude-3.5-haiku",
    "context": "200K",
    "pricing": {
      "input": "$0.80/M",
      "output": "$4.00/M",
      "cachedInput": "$0.08/M",
      "cachedOutput": "$1.00/M"
    },
    "providers": [
      {
        "provider": "anthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=48&q=75"
      },
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      },
      {
        "provider": "vertexAnthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvertex%20ai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "xai/grok-2-vision",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/grok-2-vision",
    "context": "33K",
    "pricing": {
      "input": "$2.00/M",
      "output": "$10.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "xai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/o4-mini",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/o4-mini",
    "context": "200K",
    "pricing": {
      "input": "$1.10/M",
      "output": "$4.40/M",
      "cachedInput": "$0.28/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "azure",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fazure.png&w=48&q=75"
      },
      {
        "provider": "openai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "alibaba/qwen3-next-80b-a3b-instruct",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/qwen3-next-80b-a3b-instruct",
    "context": "131K",
    "pricing": {
      "input": "$0.15/M",
      "output": "$1.50/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "alibaba",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=48&q=75"
      },
      {
        "provider": "novita",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fnovita.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "deepseek/deepseek-r1",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fdeepseek.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/deepseek-r1",
    "context": "164K",
    "pricing": {
      "input": "$0.79/M",
      "output": "$4.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      },
      {
        "provider": "parasail",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fparasail.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "meta/llama-3.3-70b",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmeta.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/llama-3.3-70b",
    "context": "128K",
    "pricing": {
      "input": "$0.72/M",
      "output": "$0.72/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      },
      {
        "provider": "cerebras",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fcerebras.png&w=48&q=75"
      },
      {
        "provider": "groq",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgroq.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "mistral/codestral",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/codestral",
    "context": "256K",
    "pricing": {
      "input": "$0.30/M",
      "output": "$0.90/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "mistral",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "meta/llama-4-scout",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmeta.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/llama-4-scout",
    "context": "128K",
    "pricing": {
      "input": "$0.08/M",
      "output": "$0.30/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      },
      {
        "provider": "cerebras",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fcerebras.png&w=48&q=75"
      },
      {
        "provider": "deepinfra",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fdeepinfra.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/gpt-oss-20b",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gpt-oss-20b",
    "context": "128K",
    "pricing": {
      "input": "$0.07/M",
      "output": "$0.30/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      },
      {
        "provider": "fireworks",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Ffireworks.png&w=48&q=75"
      },
      {
        "provider": "groq",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgroq.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "meta/llama-3.1-8b",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmeta.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/llama-3.1-8b",
    "context": "128K",
    "pricing": {
      "input": "$0.05/M",
      "output": "$0.08/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      },
      {
        "provider": "cerebras",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fcerebras.png&w=48&q=75"
      },
      {
        "provider": "groq",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgroq.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "anthropic/claude-3.5-sonnet",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/claude-3.5-sonnet",
    "context": "200K",
    "pricing": {
      "input": "$3.00/M",
      "output": "$15.00/M",
      "cachedInput": "$0.30/M",
      "cachedOutput": "$3.75/M"
    },
    "providers": [
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      },
      {
        "provider": "vertexAnthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvertex%20ai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "perplexity/sonar-pro",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fperplexity.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/sonar-pro",
    "context": "200K",
    "pricing": {
      "input": "$3.00/M",
      "output": "$15.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "perplexity",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fperplexity.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "anthropic/claude-opus-4",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/claude-opus-4",
    "context": "200K",
    "pricing": {
      "input": "$15.00/M",
      "output": "$75.00/M",
      "cachedInput": "$1.50/M",
      "cachedOutput": "$18.75/M"
    },
    "providers": [
      {
        "provider": "anthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=48&q=75"
      },
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      },
      {
        "provider": "vertexAnthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvertex%20ai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "alibaba/qwen-3-32b",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/qwen-3-32b",
    "context": "128K",
    "pricing": {
      "input": "$0.10/M",
      "output": "$0.30/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      },
      {
        "provider": "cerebras",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fcerebras.png&w=48&q=75"
      },
      {
        "provider": "deepinfra",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fdeepinfra.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "xai/grok-2",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/grok-2",
    "context": "131K",
    "pricing": {
      "input": "$2.00/M",
      "output": "$10.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "xai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "xai/grok-3-fast",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/grok-3-fast",
    "context": "131K",
    "pricing": {
      "input": "$5.00/M",
      "output": "$25.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "xai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "meituan/longcat-flash-chat",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmeituan.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/longcat-flash-chat",
    "context": "128K",
    "pricing": {
      "input": "$0.00/M",
      "output": "$0.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "chutes",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fchutes.png&w=48&q=75"
      },
      {
        "provider": "meituan",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmeituan.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "alibaba/qwen-3-14b",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/qwen-3-14b",
    "context": "41K",
    "pricing": {
      "input": "$0.06/M",
      "output": "$0.24/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "deepinfra",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fdeepinfra.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "deepseek/deepseek-v3.1-terminus",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fdeepseek.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/deepseek-v3.1-terminus",
    "context": "131K",
    "pricing": {
      "input": "$0.27/M",
      "output": "$1.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "novita",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fnovita.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "stealth/sonoma-sky-alpha",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fstealth.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/sonoma-sky-alpha",
    "context": "2M",
    "pricing": {
      "input": "$0.20/M",
      "output": "$0.50/M",
      "cachedInput": "$0.05/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "stealth",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fstealth.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/o3-mini",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/o3-mini",
    "context": "200K",
    "pricing": {
      "input": "$1.10/M",
      "output": "$4.40/M",
      "cachedInput": "$0.55/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "azure",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fazure.png&w=48&q=75"
      },
      {
        "provider": "openai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "mistral/mistral-small",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/mistral-small",
    "context": "32K",
    "pricing": {
      "input": "$0.10/M",
      "output": "$0.30/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "mistral",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/gpt-4-turbo",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gpt-4-turbo",
    "context": "128K",
    "pricing": {
      "input": "$10.00/M",
      "output": "$30.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "openai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "alibaba/qwen3-vl-instruct",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/qwen3-vl-instruct",
    "context": "131K",
    "pricing": {
      "input": "$0.70/M",
      "output": "$2.80/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "alibaba",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "zai/glm-4.5-air",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fzai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/glm-4.5-air",
    "context": "128K",
    "pricing": {
      "input": "$0.20/M",
      "output": "$1.10/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "zai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fzai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "xai/grok-3",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/grok-3",
    "context": "131K",
    "pricing": {
      "input": "$3.00/M",
      "output": "$15.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "xai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "zai/glm-4.5",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fzai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/glm-4.5",
    "context": "128K",
    "pricing": {
      "input": "$0.60/M",
      "output": "$2.20/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "novita",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fnovita.png&w=48&q=75"
      },
      {
        "provider": "zai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fzai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "meta/llama-3.1-70b",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmeta.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/llama-3.1-70b",
    "context": "128K",
    "pricing": {
      "input": "$0.72/M",
      "output": "$0.72/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "mistral/mistral-large",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/mistral-large",
    "context": "32K",
    "pricing": {
      "input": "$2.00/M",
      "output": "$6.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "mistral",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "perplexity/sonar-reasoning-pro",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fperplexity.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/sonar-reasoning-pro",
    "context": "127K",
    "pricing": {
      "input": "$2.00/M",
      "output": "$8.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "perplexity",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fperplexity.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "alibaba/qwen3-coder-30b-a3b",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/qwen3-coder-30b-a3b",
    "context": "262K",
    "pricing": {
      "input": "$0.15/M",
      "output": "$0.60/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "morph/morph-v3-large",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmorph.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/morph-v3-large",
    "context": "82K",
    "pricing": {
      "input": "$0.90/M",
      "output": "$1.90/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "morph",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmorph.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "xai/grok-3-mini-fast",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/grok-3-mini-fast",
    "context": "131K",
    "pricing": {
      "input": "$0.60/M",
      "output": "$4.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "xai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fxai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "vercel/v0-1.5-md",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvercel.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/v0-1.5-md",
    "context": "128K",
    "pricing": {
      "input": "$3.00/M",
      "output": "$15.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "vercel",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvercel.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "alibaba/qwen3-next-80b-a3b-thinking",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/qwen3-next-80b-a3b-thinking",
    "context": "131K",
    "pricing": {
      "input": "$0.15/M",
      "output": "$1.50/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "alibaba",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=48&q=75"
      },
      {
        "provider": "novita",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fnovita.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/gpt-3.5-turbo",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gpt-3.5-turbo",
    "context": "16K",
    "pricing": {
      "input": "$0.50/M",
      "output": "$1.50/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "openai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "perplexity/sonar-reasoning",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fperplexity.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/sonar-reasoning",
    "context": "127K",
    "pricing": {
      "input": "$1.00/M",
      "output": "$5.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "perplexity",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fperplexity.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "zai/glm-4.5v",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fzai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/glm-4.5v",
    "context": "66K",
    "pricing": {
      "input": "$0.60/M",
      "output": "$1.80/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "novita",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fnovita.png&w=48&q=75"
      },
      {
        "provider": "zai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fzai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "vercel/v0-1.0-md",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvercel.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/v0-1.0-md",
    "context": "128K",
    "pricing": {
      "input": "$3.00/M",
      "output": "$15.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "vercel",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvercel.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "alibaba/qwen3-coder-plus",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/qwen3-coder-plus",
    "context": "1M",
    "pricing": {
      "input": "$1.00/M",
      "output": "$5.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "alibaba",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "mistral/magistral-small-2506",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/magistral-small-2506",
    "context": "128K",
    "pricing": {
      "input": "$0.50/M",
      "output": "$1.50/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "mistral",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/gpt-oss-safeguard-20b",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gpt-oss-safeguard-20b",
    "context": "131K",
    "pricing": {
      "input": "$0.07/M",
      "output": "$0.30/M",
      "cachedInput": "$0.04/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "groq",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fgroq.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "alibaba/qwen3-max-preview",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/qwen3-max-preview",
    "context": "262K",
    "pricing": {
      "input": "$1.20/M",
      "output": "$6.00/M",
      "cachedInput": "$0.24/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "alibaba",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "mistral/mistral-medium",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/mistral-medium",
    "context": "128K",
    "pricing": {
      "input": "$0.40/M",
      "output": "$2.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "mistral",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "mistral/magistral-small",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/magistral-small",
    "context": "128K",
    "pricing": {
      "input": "$0.50/M",
      "output": "$1.50/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "mistral",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "mistral/pixtral-large",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/pixtral-large",
    "context": "128K",
    "pricing": {
      "input": "$2.00/M",
      "output": "$6.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "mistral",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/gpt-5-pro",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gpt-5-pro",
    "context": "400K",
    "pricing": {
      "input": "$15.00/M",
      "output": "$120.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "openai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "mistral/magistral-medium-2506",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/magistral-medium-2506",
    "context": "128K",
    "pricing": {
      "input": "$2.00/M",
      "output": "$5.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "mistral",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "amazon/nova-micro",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/nova-micro",
    "context": "128K",
    "pricing": {
      "input": "$0.04/M",
      "output": "$0.14/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "meta/llama-3.2-90b",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmeta.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/llama-3.2-90b",
    "context": "128K",
    "pricing": {
      "input": "$0.72/M",
      "output": "$0.72/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/o1",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/o1",
    "context": "200K",
    "pricing": {
      "input": "$15.00/M",
      "output": "$60.00/M",
      "cachedInput": "$7.50/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "azure",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fazure.png&w=48&q=75"
      },
      {
        "provider": "openai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "amazon/nova-pro",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/nova-pro",
    "context": "300K",
    "pricing": {
      "input": "$0.80/M",
      "output": "$3.20/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "mistral/pixtral-12b",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/pixtral-12b",
    "context": "128K",
    "pricing": {
      "input": "$0.15/M",
      "output": "$0.15/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "mistral",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "anthropic/claude-3.5-sonnet-20240620",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/claude-3.5-sonnet-20240620",
    "context": "200K",
    "pricing": {
      "input": "$3.00/M",
      "output": "$15.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      },
      {
        "provider": "vertexAnthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvertex%20ai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "mistral/ministral-8b",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/ministral-8b",
    "context": "128K",
    "pricing": {
      "input": "$0.10/M",
      "output": "$0.10/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "mistral",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "meta/llama-3.2-11b",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmeta.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/llama-3.2-11b",
    "context": "128K",
    "pricing": {
      "input": "$0.16/M",
      "output": "$0.16/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "meituan/longcat-flash-thinking",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmeituan.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/longcat-flash-thinking",
    "context": "128K",
    "pricing": {
      "input": "$0.15/M",
      "output": "$1.50/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "chutes",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fchutes.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "alibaba/qwen3-vl-thinking",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/qwen3-vl-thinking",
    "context": "131K",
    "pricing": {
      "input": "$0.70/M",
      "output": "$8.40/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "alibaba",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "alibaba/qwen-3-30b",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Falibaba%20cloud.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/qwen-3-30b",
    "context": "41K",
    "pricing": {
      "input": "$0.08/M",
      "output": "$0.29/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "deepinfra",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fdeepinfra.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "anthropic/claude-3-opus",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/claude-3-opus",
    "context": "200K",
    "pricing": {
      "input": "$15.00/M",
      "output": "$75.00/M",
      "cachedInput": "$1.50/M",
      "cachedOutput": "$18.75/M"
    },
    "providers": [
      {
        "provider": "anthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fanthropic.png&w=48&q=75"
      },
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      },
      {
        "provider": "vertexAnthropic",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fvertex%20ai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "cohere/command-a",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fcohere.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/command-a",
    "context": "256K",
    "pricing": {
      "input": "$2.50/M",
      "output": "$10.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "cohere",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fcohere.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "inception/mercury-coder-small",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Finception.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/mercury-coder-small",
    "context": "32K",
    "pricing": {
      "input": "$0.25/M",
      "output": "$1.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "inception",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Finception.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "meta/llama-3.2-1b",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmeta.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/llama-3.2-1b",
    "context": "128K",
    "pricing": {
      "input": "$0.10/M",
      "output": "$0.10/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "meta/llama-3.2-3b",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmeta.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/llama-3.2-3b",
    "context": "128K",
    "pricing": {
      "input": "$0.15/M",
      "output": "$0.15/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "bedrock",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Famazon%20bedrock.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "mistral/devstral-small",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/devstral-small",
    "context": "128K",
    "pricing": {
      "input": "$0.10/M",
      "output": "$0.30/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "mistral",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "mistral/magistral-medium",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/magistral-medium",
    "context": "128K",
    "pricing": {
      "input": "$2.00/M",
      "output": "$5.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "mistral",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "mistral/mixtral-8x22b-instruct",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmistral.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/mixtral-8x22b-instruct",
    "context": "66K",
    "pricing": {
      "input": "$1.20/M",
      "output": "$1.20/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "fireworks",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Ffireworks.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "moonshotai/kimi-k2-turbo",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmoonshotai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/kimi-k2-turbo",
    "context": "256K",
    "pricing": {
      "input": "$2.40/M",
      "output": "$10.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "moonshotai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmoonshotai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "morph/morph-v3-fast",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmorph.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/morph-v3-fast",
    "context": "82K",
    "pricing": {
      "input": "$0.80/M",
      "output": "$1.20/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "morph",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fmorph.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/gpt-3.5-turbo-instruct",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/gpt-3.5-turbo-instruct",
    "context": "8K",
    "pricing": {
      "input": "$1.50/M",
      "output": "$2.00/M",
      "cachedInput": "—",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "openai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "openai/o3-deep-research",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/o3-deep-research",
    "context": "200K",
    "pricing": {
      "input": "$10.00/M",
      "output": "$40.00/M",
      "cachedInput": "$2.50/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "openai",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fopenai.png&w=48&q=75"
      }
    ]
  },
  {
    "model": "stealth/sonoma-dusk-alpha",
    "modelImage": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fstealth.png&w=64&q=75",
    "modelLink": "https://vercel.com/ai-gateway/models/sonoma-dusk-alpha",
    "context": "2M",
    "pricing": {
      "input": "$0.20/M",
      "output": "$0.50/M",
      "cachedInput": "$0.05/M",
      "cachedOutput": "—"
    },
    "providers": [
      {
        "provider": "stealth",
        "icon": "https://vercel.com/vc-ap-vercel-marketing/_next/image?url=https%3A%2F%2F7nyt0uhk7sse4zvn.public.blob.vercel-storage.com%2Fdocs-assets%2Fstatic%2Fdocs%2Fai-gateway%2Flogos%2Fstealth.png&w=48&q=75"
      }
    ]
  }
]