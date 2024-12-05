import { NextFunction, Request, Response } from "express";
import ipRangeCheck from "ip-range-check";

import net from "net";

declare global {
  namespace Express {
    export interface Request {
      /**
       * Undefined if the request is not coming through cloudflare
       */
      cloudflareIp?: string;
    }
  }
}

export interface ExpressCloudflareIpOptions {
  /**
   * Default value: x-forwarded-for
   * Change this if you have a different configuration on cloudflare
   */
  cloudflareHeader?: string;
}

const defaultExpressCloudflareOptions = (
  opts?: ExpressCloudflareIpOptions
): Required<ExpressCloudflareIpOptions> => {
  const defaultOpts: Required<ExpressCloudflareIpOptions> = {
    cloudflareHeader: "x-forwarded-for",
  };

  return Object.assign(defaultOpts, opts || {});
};

const sanitizeIfIpV4 = (ip: any): string => {
  if (typeof ip !== "string") return ip;
  if (ip.startsWith("::ffff:")) return ip.slice(7);
  return ip;
};

const extractRequestIp = (req: Request): string => {
  return req.ip as string;
};

const fromCloudflare = (ip: string, family: number) => {
  const cloudflareIpRanges: Record<string, string[]> = {
    4: [
      "103.21.244.0/22",
      "103.22.200.0/22",
      "103.31.4.0/22",
      "104.16.0.0/13",
      "104.24.0.0/14",
      "108.162.192.0/18",
      "131.0.72.0/22",
      "141.101.64.0/18",
      "162.158.0.0/15",
      "172.64.0.0/13",
      "173.245.48.0/20",
      "188.114.96.0/20",
      "190.93.240.0/20",
      "197.234.240.0/22",
      "198.41.128.0/17",
    ],
    6: [
      "2400:cb00::/32",
      "2606:4700::/32",
      "2803:f800::/32",
      "2405:b500::/32",
      "2405:8100::/32",
      "2a06:98c0::/29",
      "2c0f:f248::/32",
    ],
  };

  return !!ipRangeCheck(ip, cloudflareIpRanges[family.toString()]);
};

export const expressCloudflareIp = (opts?: ExpressCloudflareIpOptions) => {
  const fullOpts = defaultExpressCloudflareOptions(opts);

  return (req: Request, _res: Response, next: NextFunction) => {
    const ip = extractRequestIp(req);
    const reqIp = sanitizeIfIpV4(ip);
    if (!reqIp) return next();

    const ipFromCloudflare = req.header(fullOpts.cloudflareHeader) as string;
    const ipFamily = net.isIP(reqIp);

    const fromCf = fromCloudflare(reqIp, ipFamily);

    if (fromCf) {
      req.cloudflareIp = ipFromCloudflare;
    }

    next();
  };
};
