/* stickers.js: thêm sticker (GIF, PNG, WebP, MP4, WebM) lên trang chúc mừng.

   Cách dùng: đặt file này cạnh index.html, rồi thêm đúng 1 dòng ngay trước </body>:
       <script src="stickers.js"></script>

   Mỗi sticker là một dòng trong STICKERS bên dưới:
     src     đường dẫn file, ví dụ "images/meo.gif". Để "" thì bỏ qua sticker đó.
     at      dán vào đâu: "cover" (mảnh vải mở đầu), "name" (dòng tên), "photo" (khung ảnh chung),
             "gift" (ảnh/phần món quà), "caption" (chú thích dưới ảnh quà), "sign" (chữ ký cuối trang),
             "under-photo" (dưới tấm ảnh đầu tiên)
     corner  góc của chỗ đó: "tl" trên-trái, "tr" trên-phải, "bl" dưới-trái, "br" dưới-phải
     size    chiều rộng hiển thị, tính bằng px (khoảng 70-110 là hợp)
     rotate  độ nghiêng, ví dụ 12 hoặc -8
     inline  true = đặt cùng dòng, ngay sau chữ (dùng với at: "caption"; bỏ qua corner)
     alt     mô tả ngắn; để "" nếu chỉ để trang trí

   Sticker đè lên góc nên nhô ra ngoài một chút. File sai đường dẫn sẽ tự biến mất, không hiện icon ảnh lỗi. */
(function () {
  const STICKERS = [
    { src: "", at: "photo", corner: "tr", size: 96, rotate: 12,  alt: "" },
    { src: "", at: "name",  corner: "tr", size: 80, rotate: -8,  alt: "" },
    { src: "images/a.gif", at: "caption", inline: true, size: 44, rotate: 0, alt: "" },
    { src: "", at: "cover", corner: "br", size: 88, rotate: 10,  alt: "" },
    { src: "images/b.gif", at: "under-photo", corner: "bl", size: 90, rotate: -5,  alt: "Thỏ trái" },
    { src: "images/c.gif", at: "under-photo", corner: "br", size: 90, rotate: 8,   alt: "Thỏ phải" }
  ];

  const q = s => document.querySelector(s);
  const HOSTS = {
    cover: () => q(".patch"),
    name:  () => q("#name"),
    photo: () => q("#togetherSlot .photo"),
    "under-photo": () => q("#togetherSlot"),
    gift:  () => q("#giftPhotoSlot .photo") || q("#giftTitle"),
    caption: () => q("#giftPhotoSlot figcaption"),
    sign:  () => q("#from")
  };
  const CORNER = {
    tl: ["top:0;left:0",     "-30%,-30%"],
    tr: ["top:0;right:0",    "30%,-30%"],
    bl: ["bottom:0;left:0",  "-30%,30%"],
    br: ["bottom:0;right:0", "30%,30%"]
  };

  const st = document.createElement("style");
  st.textContent =
    "body{overflow-x:clip}" +
    ".sticker{position:absolute;z-index:3;height:auto;pointer-events:none;user-select:none;-webkit-user-select:none;filter:drop-shadow(0 2px 3px rgba(0,0,0,.28))}" +
    ".sticker.vid{box-sizing:border-box;background:#fff;border:4px solid #fff;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,.28);filter:none}";
  document.head.appendChild(st);

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Video chỉ chạy khi đang hiện trên màn hình (phần chính bị ẩn cho tới lúc mở quà)
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) e.target.play().catch(() => {}); else e.target.pause();
      }), { threshold: 0.1 })
    : null;

  STICKERS.forEach(s => {
    if (!s || !s.src) return;
    const host = (HOSTS[s.at] || (() => null))();
    if (!host) return;
    if (getComputedStyle(host).position === "static") host.style.position = "relative";

    const isVid = /\.(mp4|webm|mov|m4v)([?#].*)?$/i.test(s.src);
    let el;
    if (isVid) {
      el = document.createElement("video");
      el.muted = true; el.loop = true; el.playsInline = true; el.autoplay = !reduce;
      el.setAttribute("muted", ""); el.setAttribute("playsinline", "");
      el.disablePictureInPicture = true;
      el.preload = "auto";
      el.setAttribute("aria-hidden", "true");
      el.src = s.src;
      if (io && !reduce) io.observe(el);
    } else {
      el = new Image();
      el.alt = s.alt || "";
      el.decoding = "async";
      el.src = s.src;
    }
    el.className = "sticker" + (isVid ? " vid" : "");
    el.onerror = () => { console.warn("Không tải được sticker:", s.src); el.remove(); };

    if (s.inline) {
      el.style.cssText = "position:static;display:inline-block;vertical-align:middle;margin:-8px 0 -8px 8px;width:" +
        (s.size || 44) + "px;transform:rotate(" + (s.rotate || 0) + "deg)";
      host.appendChild(el);
      return;
    }
    const c = CORNER[s.corner] || CORNER.tr;
    el.style.cssText = "width:" + (s.size || 90) + "px;" + c[0] +
      ";transform:translate(" + c[1] + ") rotate(" + (s.rotate || 0) + "deg)";
    host.appendChild(el);
  });
})();
