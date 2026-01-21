# 基础设置

## 开启 gzip 压缩

如在 Nginx 服务器上，为 JS、CSS 等静态资源开启 Gzip 压缩，体积会有明显缩小。你可以通过检查网络请求的响应头中的 Content-Encoding: gzip 来确认资源是否已经被 Gzip 压缩。

配置 Nginx 服务器如下：

```nginx
# /etc/nginx/nginx.conf 或 server 配置块内
http {
    # 开启 gzip 压缩
    gzip on;

    # 最小压缩文件大小（字节）
    gzip_min_length 1024;

    # gzip 压缩级别（1-9，数字越大压缩率越高，CPU 消耗越大）
    gzip_comp_level 6;

    # 启用压缩的 MIME 类型
    gzip_types text/plain text/css text/xml text/javascript
               application/javascript application/x-javascript
               application/xml application/json
               application/rss+xml application/atom+xml
               image/svg+xml;

    # 禁用对 IE6 的 gzip（IE6 某些版本不支持）
    gzip_disable "MSIE [1-6]\.";

    # 添加 Vary: Accept-Encoding 响应头
    gzip_vary on;

    # 开启对代理请求的压缩
    gzip_proxied any;

    # gzip 缓冲区数量和大小
    gzip_buffers 16 8k;

    # 设置用于压缩响应的缓冲区数量和大小
    gzip_http_version 1.1;
}
```

## 开启 http2 多路复用

在 HTTP/1.x 中，每个请求/响应对都需要一个单独的 TCP 连接。HTTP/2 允许在单个 TCP 连接上并行交错多个请求和响应，减少了连接的开销和延迟。

## 开启 cdn 就近访问

将静态文件、音视频、图片等分发到全球各地的服务器，通过从附近的 CDN 服务器提供资源，可以减少延迟并提高加载速度。
