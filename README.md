# Clash Subscription Converter

[English](#english) | [中文](#中文)

---

## English

A proxy subscription converter built on Cloudflare Workers that converts various proxy protocols to Mihomo (Clash Meta) YAML configuration.

### Features

- 🚀 **Serverless Deployment** - Runs on Cloudflare Workers edge network
- 🔄 **Multiple Protocols** - Supports VMess, VLESS, Hysteria, Hysteria2, Shadowsocks, Trojan
- 🎨 **Web UI** - Beautiful web interface for easy conversion
- 📝 **Rename Rules** - Support custom proxy name renaming with regex
- ⚡ **Fast & Reliable** - Leverages Cloudflare's global CDN

### Supported Protocols

| Protocol    | URI Scheme               |
| ----------- | ------------------------ |
| VMess       | `vmess://`               |
| VLESS       | `vless://`               |
| Hysteria    | `hysteria://`            |
| Hysteria2   | `hysteria2://`, `hy2://` |
| Shadowsocks | `ss://`                  |
| Trojan      | `trojan://`              |

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18.0.0
- [pnpm](https://pnpm.io/) (recommended) or npm
- [Cloudflare Account](https://dash.cloudflare.com/sign-up) (for deployment)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/lihuu/clash-subscription-converter.git
cd clash-subscription-converter
```

2. Install dependencies:

```bash
pnpm install
```

### Development

Start the local development server:

```bash
pnpm dev
```

The server will start at `http://localhost:8787`.

### Testing

Run the test suite:

```bash
pnpm test
```

### Deployment

#### Deploy to Cloudflare Workers

1. Login to Cloudflare (first time only):

```bash
npx wrangler login
```

2. Deploy:

```bash
pnpm deploy
```

### Dependencies

#### Production Dependencies

| Package                                          | Version | Description                |
| ------------------------------------------------ | ------- | -------------------------- |
| [js-yaml](https://www.npmjs.com/package/js-yaml) | ^4.1.1  | YAML parser and serializer |

#### Development Dependencies

| Package                                                                                          | Version | Description                        |
| ------------------------------------------------------------------------------------------------ | ------- | ---------------------------------- |
| [@cloudflare/vitest-pool-workers](https://www.npmjs.com/package/@cloudflare/vitest-pool-workers) | ^0.12.4 | Vitest pool for Cloudflare Workers |
| [@cloudflare/workers-types](https://www.npmjs.com/package/@cloudflare/workers-types)             | ^4.x    | TypeScript types for Workers       |
| [@types/js-yaml](https://www.npmjs.com/package/@types/js-yaml)                                   | ^4.0.9  | TypeScript types for js-yaml       |
| [typescript](https://www.npmjs.com/package/typescript)                                           | ^5.5.2  | TypeScript compiler                |
| [vitest](https://www.npmjs.com/package/vitest)                                                   | ~3.2.0  | Testing framework                  |
| [wrangler](https://www.npmjs.com/package/wrangler)                                               | ^4.60.0 | Cloudflare Workers CLI             |

### API Usage

#### GET /convert

Convert subscription URL to Mihomo config.

**Parameters:**

- `url` (required): Base64 encoded subscription URL
- `rename` (optional): URL encoded rename rules

**Example:**

```
GET /convert?url=aHR0cHM6Ly9leGFtcGxlLmNvbS9zdWI=
```

#### POST /convert

Convert direct proxy links to Mihomo config.

**Body:** Base64 encoded proxy links (one per line)

**Parameters:**

- `rename` (optional): URL encoded rename rules

### Project Structure

```
clash-subscription-converter/
├── src/
│   ├── index.ts          # Main worker entry point
│   ├── types.ts          # TypeScript type definitions
│   ├── rename.ts         # Rename rules parser
│   ├── generator/
│   │   └── mihomo.ts     # Mihomo YAML config generator
│   ├── parsers/
│   │   ├── index.ts      # Parser exports
│   │   ├── vmess.ts      # VMess parser
│   │   ├── vless.ts      # VLESS parser
│   │   ├── hysteria.ts   # Hysteria parser
│   │   ├── hysteria2.ts  # Hysteria2 parser
│   │   ├── shadowsocks.ts # Shadowsocks parser
│   │   └── trojan.ts     # Trojan parser
│   └── ui/
│       └── page.ts       # Web UI HTML
├── test/                 # Test files
├── package.json
├── tsconfig.json
├── wrangler.jsonc        # Cloudflare Workers config
└── vitest.config.mts
```

### License

MIT

---

## 中文

基于 Cloudflare Workers 构建的代理订阅转换工具，可将多种代理协议转换为 Mihomo (Clash Meta) YAML 配置。

### 功能特性

- 🚀 **无服务器部署** - 运行在 Cloudflare Workers 边缘网络
- 🔄 **多协议支持** - 支持 VMess、VLESS、Hysteria、Hysteria2、Shadowsocks、Trojan
- 🎨 **Web 界面** - 美观的网页界面，方便操作
- 📝 **重命名规则** - 支持使用正则表达式自定义代理节点名称
- ⚡ **快速可靠** - 利用 Cloudflare 全球 CDN 加速

### 支持的协议

| 协议        | URI 格式                 |
| ----------- | ------------------------ |
| VMess       | `vmess://`               |
| VLESS       | `vless://`               |
| Hysteria    | `hysteria://`            |
| Hysteria2   | `hysteria2://`, `hy2://` |
| Shadowsocks | `ss://`                  |
| Trojan      | `trojan://`              |

### 环境要求

- [Node.js](https://nodejs.org/) >= 18.0.0
- [pnpm](https://pnpm.io/)（推荐）或 npm
- [Cloudflare 账户](https://dash.cloudflare.com/sign-up)（用于部署）

### 安装

1. 克隆仓库：

```bash
git clone https://github.com/lihuu/clash-subscription-converter.git
cd clash-subscription-converter
```

2. 安装依赖：

```bash
pnpm install
```

### 开发

启动本地开发服务器：

```bash
pnpm dev
```

服务将在 `http://localhost:8787` 启动。

### 测试

运行测试：

```bash
pnpm test
```

### 部署

#### 部署到 Cloudflare Workers

1. 登录 Cloudflare（首次部署需要）：

```bash
npx wrangler login
```

2. 部署：

```bash
pnpm deploy
```

### 依赖说明

#### 生产依赖

| 包名                                             | 版本   | 说明                |
| ------------------------------------------------ | ------ | ------------------- |
| [js-yaml](https://www.npmjs.com/package/js-yaml) | ^4.1.1 | YAML 解析和序列化库 |

#### 开发依赖

| 包名                                                                                             | 版本    | 说明                                |
| ------------------------------------------------------------------------------------------------ | ------- | ----------------------------------- |
| [@cloudflare/vitest-pool-workers](https://www.npmjs.com/package/@cloudflare/vitest-pool-workers) | ^0.12.4 | Cloudflare Workers 的 Vitest 测试池 |
| [@cloudflare/workers-types](https://www.npmjs.com/package/@cloudflare/workers-types)             | ^4.x    | Workers TypeScript 类型定义         |
| [@types/js-yaml](https://www.npmjs.com/package/@types/js-yaml)                                   | ^4.0.9  | js-yaml 的 TypeScript 类型定义      |
| [typescript](https://www.npmjs.com/package/typescript)                                           | ^5.5.2  | TypeScript 编译器                   |
| [vitest](https://www.npmjs.com/package/vitest)                                                   | ~3.2.0  | 测试框架                            |
| [wrangler](https://www.npmjs.com/package/wrangler)                                               | ^4.60.0 | Cloudflare Workers CLI 工具         |

### API 使用

#### GET /convert

将订阅链接转换为 Mihomo 配置。

**参数：**

- `url`（必需）：Base64 编码的订阅地址
- `rename`（可选）：URL 编码的重命名规则

**示例：**

```
GET /convert?url=aHR0cHM6Ly9leGFtcGxlLmNvbS9zdWI=
```

#### POST /convert

将代理链接直接转换为 Mihomo 配置。

**请求体：** Base64 编码的代理链接（每行一个）

**参数：**

- `rename`（可选）：URL 编码的重命名规则

### 项目结构

```
clash-subscription-converter/
├── src/
│   ├── index.ts          # Workers 主入口
│   ├── types.ts          # TypeScript 类型定义
│   ├── rename.ts         # 重命名规则解析器
│   ├── generator/
│   │   └── mihomo.ts     # Mihomo YAML 配置生成器
│   ├── parsers/
│   │   ├── index.ts      # 解析器导出
│   │   ├── vmess.ts      # VMess 解析器
│   │   ├── vless.ts      # VLESS 解析器
│   │   ├── hysteria.ts   # Hysteria 解析器
│   │   ├── hysteria2.ts  # Hysteria2 解析器
│   │   ├── shadowsocks.ts # Shadowsocks 解析器
│   │   └── trojan.ts     # Trojan 解析器
│   └── ui/
│       └── page.ts       # Web 界面 HTML
├── test/                 # 测试文件
├── package.json
├── tsconfig.json
├── wrangler.jsonc        # Cloudflare Workers 配置
└── vitest.config.mts
```

### 许可证

MIT
