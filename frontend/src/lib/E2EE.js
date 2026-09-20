/* eslint-disable no-unused-vars */
// Chuyển đổi qua lại giữa ArrayBuffer (Nhị phân) và Base64 (Chuỗi để lưu DB)
export const buf2base64 = (buf) =>
  window.btoa(String.fromCharCode(...new Uint8Array(buf)));
export const base642buf = (b64) =>
  Uint8Array.from(window.atob(b64), (c) => c.charCodeAt(0)).buffer;

export const E2EE = {
  // ==========================================
  // 1. RSA: TẠO KHÓA BẤT ĐỐI XỨNG
  // ==========================================
  generateRSAKeyPair: async () => {
    return await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"],
    );
  },
  exportPublicKey: async (publicKey) => {
    const exported = await window.crypto.subtle.exportKey("spki", publicKey);
    return buf2base64(exported);
  },
  importPublicKey: async (base64Key) => {
    return await window.crypto.subtle.importKey(
      "spki",
      base642buf(base64Key),
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"],
    );
  },
  // Xuất Private Key ra chuỗi Base64 để lưu vào LocalStorage
  exportPrivateKey: async (privateKey) => {
    const exported = await window.crypto.subtle.exportKey("pkcs8", privateKey);
    return buf2base64(exported);
  },
  // Chuyển chuỗi Base64 từ LocalStorage thành Private Key Object
  importPrivateKey: async (base64Key) => {
    return await window.crypto.subtle.importKey(
      "pkcs8",
      base642buf(base64Key),
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["decrypt"],
    );
  },
  // ==========================================
  // 2. SHA-256: HÀM BĂM KIỂM TRA TOÀN VẸN
  // ==========================================
  hashSHA256: async (text) => {
    const encoded = new TextEncoder().encode(text);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", encoded);
    return buf2base64(hashBuffer);
  },

  // ==========================================
  // 3. QUY TRÌNH GỬI (MÃ HÓA = AES + RSA + SHA)
  // ==========================================
  encryptMessage: async (
    plainText,
    receiverPublicKeyBase64,
    myPublicKeyBase64,
  ) => {
    const shaHash = await E2EE.hashSHA256(plainText);
    const aesKey = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedText = new TextEncoder().encode(plainText);
    const cipherBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      aesKey,
      encodedText,
    );
    const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);

    // 1. Mã hóa khóa AES cho người nhận
    const receiverPubKey = await E2EE.importPublicKey(receiverPublicKeyBase64);
    const encryptedAesBuffer = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      receiverPubKey,
      rawAesKey,
    );

    // 2. Mã hóa khóa AES cho chính mình (để xem lại)
    let senderEncryptedAesBuffer = null;
    if (myPublicKeyBase64) {
      const myPubKey = await E2EE.importPublicKey(myPublicKeyBase64);
      senderEncryptedAesBuffer = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        myPubKey,
        rawAesKey,
      );
    }

    return {
      text: buf2base64(cipherBuffer),
      encryptedAesKey: buf2base64(encryptedAesBuffer),
      senderEncryptedAesKey: senderEncryptedAesBuffer
        ? buf2base64(senderEncryptedAesBuffer)
        : "",
      iv: buf2base64(iv),
      shaHash: shaHash,
    };
  },

  // ==========================================
  // 4. QUY TRÌNH NHẬN (GIẢI MÃ & KIỂM TRA SHA)
  // ==========================================
  decryptMessage: async (encryptedPayload, myPrivateKey) => {
    try {
      if (!encryptedPayload.encryptedAesKey) return encryptedPayload.text; // Bỏ qua nếu là tin nhắn cũ (chưa mã hóa)

      // Bước 1: Dùng RSA Private Key giải mã khóa AES
      const decryptedAesRaw = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        myPrivateKey,
        base642buf(encryptedPayload.encryptedAesKey),
      );
      const aesKey = await window.crypto.subtle.importKey(
        "raw",
        decryptedAesRaw,
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"],
      );

      // Bước 2: Dùng khóa AES giải mã nội dung
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: base642buf(encryptedPayload.iv) },
        aesKey,
        base642buf(encryptedPayload.text),
      );
      const plainText = new TextDecoder().decode(decryptedBuffer);

      // Bước 3: Băm SHA-256 lại nội dung vừa giải mã và so sánh
      const verifyHash = await E2EE.hashSHA256(plainText);
      if (verifyHash !== encryptedPayload.shaHash) {
        return "⚠️ [CẢNH BÁO: Tin nhắn đã bị thay đổi trên đường truyền!]";
      }

      return plainText;
    } catch (error) {
      return "🔒 [Lỗi giải mã E2EE]";
    }
  },
};
