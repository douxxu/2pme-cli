# 2peekme CLI

A command-line interface tool for interacting with the [2PeekMe API](https://2peek.me). This CLI allows you to manage subdomains, DNS records, and your API key easily from your terminal.

>More documentaiton can be found here: [https://2peek.me](https://2peek.me)

## Installation

To install the 2peekme CLI globally, run the following command:

```bash
npm i -g 2pme
```

## Usage

After installation, you can use the CLI with the following command:

```bash
2pme [command]
```

## Commands

Here are some of the available commands:

- `key` - Manage your API key.
  - Options:
    - `--create` - Generate a new API key. 
    - `--set <key>` - Set your API key.
    - `--info` - Get information about your API key.
    - `--delete` - Delete your current API key.
  
- `create` - Create a new subdomain.
  - Options:
    - `--name <name>` - Subdomain name.
    - `--type <type>` - DNS record type (A, CNAME, TXT, etc.).
    - `--value <value>` - Record value.

- `update` - Update an existing subdomain.
  - Options:
    - `--name <name>` - Subdomain name.
    - `--type <type>` - New DNS record type.
    - `--value <value>` - New record value.

- `delete` - Delete a subdomain.
  - Options:
    - `--name <name>` - Subdomain name.

- `list` - List all subdomains.

## License

This project is licensed under the GPL-3.0 License.
