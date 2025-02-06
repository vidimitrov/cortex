import { ChromaClient, Collection } from "chromadb";

const chromaHost = process.env.CHROMA_HOST || "localhost";
const chromaPort = process.env.CHROMA_PORT || "8000";

export const chroma = new ChromaClient({
  path: `http://${chromaHost}:${chromaPort}`,
});

let resourcesCollection: Collection | null = null;

export async function getResourcesCollection() {
  if (!resourcesCollection) {
    try {
      resourcesCollection = await chroma.getOrCreateCollection({
        name: "resources",
        metadata: {
          description: "Vector embeddings for session resources",
        },
      });
    } catch (error) {
      console.error("Failed to initialize ChromaDB collection:", error);
      throw error;
    }
  }
  return resourcesCollection;
}

export async function addResourceEmbedding(
  resourceId: string,
  sessionId: string,
  content: string,
  metadata: Record<string, any> = {}
) {
  const collection = await getResourcesCollection();
  await collection.add({
    ids: [resourceId],
    metadatas: [{ ...metadata, sessionId }],
    documents: [content],
  });
}

export async function queryResourceEmbeddings(
  sessionId: string,
  query: string,
  limit: number = 5
) {
  const collection = await getResourcesCollection();
  const results = await collection.query({
    queryTexts: [query],
    nResults: limit,
    where: { sessionId },
  });

  return results;
}

export async function deleteResourceEmbedding(resourceId: string) {
  const collection = await getResourcesCollection();
  await collection.delete({
    ids: [resourceId],
  });
}

export async function updateResourceEmbedding(
  resourceId: string,
  sessionId: string,
  content: string,
  metadata: Record<string, any> = {}
) {
  await deleteResourceEmbedding(resourceId);
  await addResourceEmbedding(resourceId, sessionId, content, metadata);
}

export async function getSessionResourceEmbeddings(sessionId: string) {
  const collection = await getResourcesCollection();
  const results = await collection.get({
    where: { sessionId },
  });

  return results;
}
