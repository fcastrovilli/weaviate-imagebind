import weaviate, { type WeaviateClient } from 'weaviate-client';

let client: WeaviateClient | null = null;

export const getClient = async () => {
	if (!client) {
		client = await weaviate.connectToCustom({
			httpHost: '192.168.1.120',
			httpSecure: false,
			grpcHost: '192.168.1.120',
			grpcPort: 50051,
			grpcSecure: false
		});
	}
	return client;
};
