import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Allow fast responses
export const maxDuration = 15;

const FieldSchema = z.object({
    id: z.string(),
    type: z.enum(['text', 'textarea', 'select', 'radio', 'checkbox', 'date', 'number']),
    label: z.string(),
    placeholder: z.string().optional(),
    required: z.boolean(),
    description: z.string().optional(),
    options: z.array(z.object({
        value: z.string(),
        label: z.string(),
        description: z.string().optional(),
    })).optional(),
    validation: z.object({
        minLength: z.number().optional(),
        maxLength: z.number().optional(),
        pattern: z.string().optional(),
    }).optional(),
    dependencies: z.array(z.string()).optional(), // Fields this depends on
    rows: z.number().optional(), // For textarea
});

const FormStructureSchema = z.object({
    requestType: z.string(),
    title: z.string(),
    description: z.string(),
    sections: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        icon: z.string().optional(),
        fields: z.array(FieldSchema),
    })),
    estimatedTime: z.string().optional(),
});

export async function POST(req: Request) {
    let requestType: 'IFG' | 'IWG' | 'DZG' = 'IFG';
    let userIntent: string | undefined;
    let existingData: Record<string, any> | undefined;

    try {
        const body = await req.json();
        requestType = body.requestType || 'IFG';
        userIntent = body.userIntent;
        existingData = body.existingData;

        const systemPrompt = `You are an expert in German transparency and data access laws. Design an optimal form structure for ${requestType} requests.

${requestType === 'IFG' ? 'IFG (Informationsfreiheitsgesetz) - Freedom of Information requests for government transparency' : ''}
${requestType === 'IWG' ? 'IWG (Informationsweiterverwendungsgesetz) - Information reuse for commercial purposes' : ''}
${requestType === 'DZG' ? 'DZG (Datennutzungsgesetz) - Data access for research and high-value datasets' : ''}

IMPORTANT: Follow the exact schema structure:
- Each field MUST have a "required" property (boolean: true/false)
- Field types must be exactly: text, textarea, select, radio, checkbox, date, or number
- For select/radio/checkbox fields, include "options" array with value/label/description
- For textarea fields, include "rows" number
- Use simple, clear field IDs and labels
- Group related fields into logical sections

Create a form with the most relevant fields for this request type. Focus on:
- Legal compliance and completeness
- User experience and logical flow
- Efficient data collection
- Modern, streamlined approach

Only include fields that are actually needed for ${requestType}.`;

        const userPrompt = `Design a form structure for a ${requestType} request.
${userIntent ? `User's specific intent: ${userIntent}` : ''}
${existingData ? `Existing data context: ${JSON.stringify(existingData)}` : ''}

CRITICAL: Ensure every field has the exact structure:
{
  "id": "field_name",
  "type": "text|textarea|select|radio|checkbox|date|number",
  "label": "Field Label",
  "placeholder": "Optional placeholder text",
  "required": true|false,
  "description": "Optional field description",
  "rows": 3, // Only for textarea fields
  "options": [ // Only for select/radio/checkbox fields
    {
      "value": "option_value",
      "label": "Option Label",
      "description": "Optional option description"
    }
  ]
}

Create sections that make sense for this type of request. Include helpful descriptions and appropriate field types. Make the form as streamlined as possible while ensuring legal compliance.`;

        const result = await generateObject({
            model: openai('gpt-4o'),
            system: systemPrompt,
            prompt: userPrompt,
            schema: FormStructureSchema,
            temperature: 0.1, // Lower temperature for more consistent output
        });

        console.log('AI generated structure:', JSON.stringify(result.object, null, 2));

        // Validate the result against our schema
        try {
            const validatedStructure = FormStructureSchema.parse(result.object);
            return new Response(JSON.stringify(validatedStructure), {
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (validationError) {
            console.error('Schema validation failed:', validationError);
            console.log('Falling back to default structure');
            const fallbackStructure = getDefaultFormStructure(requestType);
            return new Response(JSON.stringify(fallbackStructure), {
                headers: { 'Content-Type': 'application/json' },
            });
        }
    } catch (error) {
        console.error('Form structure API error:', error);

        const fallbackStructure = getDefaultFormStructure(requestType);

        return new Response(JSON.stringify(fallbackStructure), {
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

function getDefaultFormStructure(requestType: string) {
    return {
        requestType,
        title: `${requestType} Data Request`,
        description: `Submit your ${requestType} request`,
        sections: [
            {
                id: 'basic',
                title: 'Basic Information',
                description: 'Essential details about your request',
                icon: 'basic',
                fields: [
                    {
                        id: 'title',
                        type: 'text' as const,
                        label: 'Request Title',
                        placeholder: 'Brief, descriptive title for your request',
                        required: true,
                        description: 'A clear, descriptive title for your request',
                    },
                    {
                        id: 'description',
                        type: 'textarea' as const,
                        label: 'Description',
                        placeholder: 'Describe what information you need',
                        required: true,
                        rows: 4,
                        description: 'Detailed description of the information you are requesting',
                    },
                ],
            },
            {
                id: 'contact',
                title: 'Contact Information',
                description: 'Your contact details',
                icon: 'personal',
                fields: [
                    {
                        id: 'name',
                        type: 'text' as const,
                        label: 'Full Name',
                        placeholder: 'Your full name',
                        required: true,
                        description: 'Your legal name as it appears on official documents',
                    },
                    {
                        id: 'email',
                        type: 'text' as const,
                        label: 'Email Address',
                        placeholder: 'your.email@example.com',
                        required: true,
                        description: 'We will use this email to communicate with you about your request',
                    },
                ],
            },
        ],
        estimatedTime: '5-10 minutes',
    };
}