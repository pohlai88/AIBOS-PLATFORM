/**
 * ManifestSigner - CLI tool for signing manifests
 * 
 * Used in CI/CD, Studio builds, and marketplace publishing
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export interface SigningResult {
  signature: string;
  checksum: string;
  keyId: string;
  algorithm: string;
  signedAt: string;
}

export class ManifestSigner {
  /**
   * Sign a manifest file with RSA private key
   */
  static signManifest(manifestPath: string, privateKeyPath: string, keyId: string): SigningResult {
    const manifest = fs.readFileSync(manifestPath, "utf8");
    const privateKey = fs.readFileSync(privateKeyPath, "utf8");

    const signer = crypto.createSign("RSA-SHA256");
    signer.update(manifest);
    signer.end();

    const signature = signer.sign(privateKey, "base64");
    const checksum = crypto.createHash("sha256").update(manifest).digest("hex");

    return {
      signature,
      checksum,
      keyId,
      algorithm: "RSA-SHA256",
      signedAt: new Date().toISOString()
    };
  }

  /**
   * Sign manifest content directly (for programmatic use)
   */
  static signContent(content: string, privateKey: string): string {
    const signer = crypto.createSign("RSA-SHA256");
    signer.update(content);
    signer.end();
    return signer.sign(privateKey, "base64");
  }

  /**
   * Sign with HMAC (for internal/dev use)
   */
  static signHMAC(content: string, secret: string): string {
    return crypto
      .createHmac("sha256", secret)
      .update(content)
      .digest("base64");
  }

  /**
   * Generate a new RSA key pair
   */
  static generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" }
    });
    return { publicKey, privateKey };
  }

  /**
   * Write signature file alongside manifest
   */
  static writeSignatureFile(manifestPath: string, result: SigningResult): string {
    const sigPath = manifestPath.replace(/\.json$/, ".sig.json");
    fs.writeFileSync(sigPath, JSON.stringify(result, null, 2));
    return sigPath;
  }

  /**
   * Sign and write in one operation
   */
  static signAndWrite(
    manifestPath: string,
    privateKeyPath: string,
    keyId: string
  ): { result: SigningResult; sigPath: string } {
    const result = this.signManifest(manifestPath, privateKeyPath, keyId);
    const sigPath = this.writeSignatureFile(manifestPath, result);
    return { result, sigPath };
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log("Usage: ts-node ManifestSigner.ts <manifest.json> <private.pem> <keyId>");
    process.exit(1);
  }

  const [manifestPath, privateKeyPath, keyId] = args;
  const { result, sigPath } = ManifestSigner.signAndWrite(manifestPath, privateKeyPath, keyId);
  console.log(`✅ Signed: ${sigPath}`);
  console.log(`   Checksum: ${result.checksum}`);
  console.log(`   Key: ${result.keyId}`);
}

