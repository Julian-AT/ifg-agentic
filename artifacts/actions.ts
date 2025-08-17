"use server";

import { getDocumentById, getSuggestionsByDocumentId } from "@/lib/db/queries";

export async function getSuggestions({ documentId }: { documentId: string }) {
  const suggestions = await getSuggestionsByDocumentId({ documentId });
  return suggestions ?? [];
}


export async function autoFillForm({ documentId }: { documentId: string }) {
  const document = await getDocumentById({ id: documentId });

  const content = document.content;

  console.log(content);


}