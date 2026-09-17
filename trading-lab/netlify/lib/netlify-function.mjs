const DEFAULT_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

export function asNetlifyFunction(handleRequest) {
  return async (request) => {
    const url = new URL(request.url);
    const event = {
      httpMethod: request.method,
      queryStringParameters: Object.fromEntries(url.searchParams.entries()),
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method === 'GET' || request.method === 'HEAD' ? null : await request.text(),
    };
    const result = await handleRequest(event);
    return new Response(result.body ?? '', {
      status: result.statusCode ?? 200,
      headers: result.headers ?? DEFAULT_HEADERS,
    });
  };
}
