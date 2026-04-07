
# 微信公众号批量查询工具

> ⚡️ 本工具是 [https://down.mptext.top/dashboard/account](https://down.mptext.top/dashboard/account) 的效率工具，专为批量导入公众号信息设计。

> 支持批量查询微信公众号信息并导出 JSON，适用于 [down.mptext.top](https://down.mptext.top) 平台配置导入。

> [!IMPORTANT]
> **重要提示：由于线上部署环境 API 请求会被目标服务器拦截并返回 403 (Forbidden) 或 CORS 跨域错误，本项目目前仅支持本地运行。请按照下方的“本地运行”步骤操作。**

## 本地运行

1. **安装依赖**
   ```bash
   pnpm i --frozen-lockfile
   ```

2. **启动开发服务器**
   ```bash
   pnpm dev
   ```

3. **访问本地预览**
   - 启动后，在浏览器中打开：[http://localhost:3000](http://localhost:3000)

## 功能简介

- 支持批量输入关键词，一键查询公众号信息
- 查询结果可导出为标准 JSON 文件
- 支持 API 密钥输入，安全调用接口
- 查询进度与错误重试友好

## 使用说明

1. 在输入框粘贴待查询的公众号关键词（每行一个）
2. 输入 API 密钥（可在 [down.mptext.top](https://down.mptext.top) 控制台获取）
3. 点击“开始批量查询”
4. 查询完成后点击“导出 JSON”下载结果
5. 将导出的 JSON 文件上传至 [down.mptext.top/dashboard/account](https://down.mptext.top/dashboard/account) 进行后续操作

## 技术栈

- [Nuxt 3](https://nuxt.com/) + [Vue 3](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [lucide-vue-next](https://lucide.dev/icons)

## API 说明

本工具通过 `/api/remote/public/v1/account` 代理接口查询公众号信息，需提供 `X-Auth-Key` 作为鉴权。

## License

MIT
