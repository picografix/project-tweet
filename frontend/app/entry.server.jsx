// Entry Server
import { PassThrough } from "stream";
import { Response } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToPipeableStream } from "react-dom/server";

export default function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onShellReady: () => {
          const body = new PassThrough();
          responseHeaders.set("Content-Type", "text/html");
          resolve(new Response(body, { headers: responseHeaders, status: didError ? 500 : responseStatusCode }));
          pipe(body);
        },
        onShellError: (err) => {
          reject(err);
        },
        onError: (err) => {
          didError = true;
          console.error(err);
        },
      }
    );

    setTimeout(abort, 5000);
  });
}
