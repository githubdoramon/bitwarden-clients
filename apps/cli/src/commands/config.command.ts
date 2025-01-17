import { OptionValues } from "commander";

import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";

import { Response } from "../models/response";
import { MessageResponse } from "../models/response/message.response";
import { StringResponse } from "../models/response/string.response";

export class ConfigCommand {
  constructor(private environmentService: EnvironmentService) {}

  async run(setting: string, value: string, options: OptionValues): Promise<Response> {
    setting = setting.toLowerCase();
    switch (setting) {
      case "server":
        return await this.getOrSetServer(value, options);
      default:
        return Response.badRequest("Unknown setting.");
    }
  }

  private async getOrSetServer(url: string, options: OptionValues): Promise<Response> {
    if (
      (url == null || url.trim() === "") &&
      !options.webVault &&
      !options.api &&
      !options.identity &&
      !options.icons &&
      !options.notifications &&
      !options.events
    ) {
      const stringRes = new StringResponse(
        this.environmentService.hasBaseUrl()
          ? this.environmentService.getUrls().base
          : "https://bitwarden.com",
      );
      return Response.success(stringRes);
    }

    url = url === "null" || url === "bitwarden.com" || url === "https://bitwarden.com" ? null : url;
    await this.environmentService.setUrls({
      base: url,
      webVault: options.webVault || null,
      api: options.api || null,
      identity: options.identity || null,
      icons: options.icons || null,
      notifications: options.notifications || null,
      events: options.events || null,
      keyConnector: options.keyConnector || null,
    });
    const res = new MessageResponse("Saved setting `config`.", null);
    return Response.success(res);
  }
}
