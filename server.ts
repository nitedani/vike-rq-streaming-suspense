import express from "express";
import { dirname, join } from "path";
import { telefunc } from "telefunc";
import { fileURLToPath } from "url";
import httpDevServer from "vavite/http-dev-server";
import { renderPage } from "vike/server";

bootstrap();

async function bootstrap() {
  const app = express();

  if (!httpDevServer) {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    app.use(express.static(join(__dirname, "..", "client")));
  }

  app.get("*", async (req, res, next) => {
    const pageContextInit = {
      urlOriginal: req.originalUrl,
    };
    const pageContext = await renderPage(pageContextInit)
    const { httpResponse } = pageContext
    if (!httpResponse) {
      return next()
    } else {
      const { statusCode, headers } = httpResponse
      headers.forEach(([name, value]) => res.setHeader(name, value))
      res.status(statusCode)
      httpResponse.pipe(res)
    }
  });

  app.use(express.text({ limit: "10mb" }));
  app.use("/_telefunc", async (req, res) => {
    const httpResponse = await telefunc({
      url: req.originalUrl,
      method: req.method,
      body: req.body,
    });
    const { body, statusCode, contentType } = httpResponse;
    res.status(statusCode).type(contentType).send(body);
  });

  if (import.meta.env.PROD) {
    const port = process.env.PORT ?? 3000;
    app.listen(port);
  } else {
    httpDevServer!.on("request", app);
  }
}
