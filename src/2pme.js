#!/usr/bin/env node

const { Command } = require('commander');
const axios = require('axios');
const colors = require('colors');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const program = new Command();
const API_BASE = 'https://api.2peek.me/';
const CONFIG_PATH = path.resolve(process.env.HOME || process.env.USERPROFILE, '.2peekme-cli.json');

// Load API key
const loadConfig = () => {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            return JSON.parse(fs.readFileSync(CONFIG_PATH));
        }
        return {};
    } catch (error) {
        console.error(colors.red.bold('Error loading configuration:'), error.message);
        return {};
    }
};

const saveConfig = (config) => {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), { mode: 0o600 });
    } catch (error) {
        console.error(colors.red.bold('Error saving configuration:'), error.message);
    }
};

// prompt
const prompt = (question) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => rl.question(colors.cyan.bold(`${question} `), (answer) => {
        rl.close();
        resolve(answer);
    }));
};

// Generates a new api key
const generateApiKey = async () => {
    try {
        const response = await axios.get(`${API_BASE}key/get`);
        if (response.data.success) {
            return response.data.result;
        } else {
            throw new Error('Failed to generate API key.');
        }
    } catch (error) {
        console.error(colors.red.bold('Error generating API key:'), error.message);
        throw error;
    }
};

// Get or prompt for API key
const getApiKey = async (overrideKey) => {
    if (overrideKey) return overrideKey;
    const config = loadConfig();
    if (!config.apiKey) {
        const newKey = await generateApiKey(); // Generate a new key if one doesnt exist
        config.apiKey = newKey;
        saveConfig(config);
        console.log(colors.green.bold('New API key generated and saved successfully.')); 
        return newKey;
    }
    return config.apiKey;
};

const handleApiResponse = (response) => {
    if (response.success) {
        return response;
    } else {
        console.error(colors.red.bold('Error:'), response.result);
        throw new Error(response.result);
    }
};

// API request handler
const apiRequest = async (endpoint, params) => {
    try {
        const response = await axios.post(`${API_BASE}${endpoint}`, null, { params });
        return handleApiResponse(response.data);
    } catch (error) {
        console.error(colors.red.bold('Request failed:'), error.message);
        throw error;
    }
};


// commands :]
program
    .name('2peekme')
    .description('CLI tool to interact with the 2PeekMe API')
    .version('1.0.0');

    program
    .command('key')
    .description('Manage your API key')
    .option('-s, --set <key>', 'Set the API key')
    .option('-c, --create', 'Create a new API key')
    .option('-d, --delete', 'Delete the API key')
    .option('-i, --info', 'Get information about the API key')
    .action(async (options) => {
        const config = loadConfig();
        if (options.set) {
            config.apiKey = options.set;
            saveConfig(config);
            console.log(colors.green.bold('API key successfully configured.'));
        } else if (options.create) {
            try {
                const data = await apiRequest('key/create', {});
                config.apiKey = data;
                saveConfig(config);
                console.log(colors.green.bold('API key created successfully:'), data);
            } catch (error) {
                console.error(colors.red.bold('Failed to create API key.'));
            }
        } else if (options.delete) {
            try {
                const apiKey = await getApiKey();
                const data = await apiRequest('key/delete', { key: apiKey });
                delete config.apiKey;
                saveConfig(config);
                console.log(colors.green.bold('API key deleted successfully:'), data);
            } catch (error) {
                console.error(colors.red.bold('Failed to delete API key.'));
            }
        } else if (options.info) {
            try {
                const apiKey = await getApiKey();
                const data = await apiRequest('key/info', { key: apiKey });
                console.log(colors.green.bold('Key Info:'), data);
            } catch (error) {
                console.error(colors.red.bold('Failed to retrieve key info.'));
            }
        } else {
            console.log(colors.yellow.bold('Use --set to configure a key, --create to generate a new key, --delete to remove a key, or --info to get details.'));
        }
    });


program
    .command('create')
    .description('Create a new subdomain')
    .option('-n, --name <name>', 'Subdomain name')
    .option('-t, --type <type>', 'DNS record type (A, AAAA, CNAME, TXT)')
    .option('-v, --value <value>', 'Record value')
    .action(async (options) => {
        try {
            const name = options.name || await prompt('Enter subdomain name:');
            const type = options.type || await prompt('Enter record type (A, AAAA, CNAME, TXT):');
            const value = options.value || await prompt('Enter record value:');

            const apiKey = await getApiKey();
            const data = await apiRequest('subdomain/create', { key: apiKey, subdomain: name, type, value });
            console.log(colors.green.bold('Subdomain created successfully:'), data.result);
        } catch (error) {
            console.error(colors.red.bold('Failed to create subdomain.'));
        }
    });

program
    .command('update')
    .description('Update an existing subdomain')
    .option('-n, --name <name>', 'Subdomain name')
    .option('-t, --type <type>', 'DNS record type (A, AAAA, CNAME, TXT)')
    .option('-v, --value <value>', 'New record value')
    .action(async (options) => {
        try {
            const name = options.name || await prompt('Enter subdomain name:');
            const type = options.type || await prompt('Enter new record type (A, AAAA, CNAME, TXT):');
            const value = options.value || await prompt('Enter new record value:');

            const apiKey = await getApiKey();
            const data = await apiRequest('subdomain/update', { key: apiKey, subdomain: name, type, value });
            console.log(colors.green.bold('Subdomain updated successfully:'), data.result);
        } catch (error) {
            console.error(colors.red.bold('Failed to update subdomain.'));
        }
    });

program
    .command('delete')
    .description('Delete a subdomain')
    .option('-n, --name <name>', 'Subdomain name')
    .action(async (options) => {
        try {
            const name = options.name || await prompt('Enter subdomain name:');

            const apiKey = await getApiKey();
            const data = await apiRequest('subdomain/delete', { key: apiKey, subdomain: name });
            console.log(colors.green.bold('Subdomain deleted successfully:'), data.result);
        } catch (error) {
            console.error(colors.red.bold('Failed to delete subdomain.'));
        }
    });

program
    .command('list')
    .description('List all subdomains')
    .action(async () => {
        try {
            const apiKey = await getApiKey();
            const data = await apiRequest('subdomain/list', { key: apiKey });

            if (data.success && Array.isArray(data.subdomains)) {
                data.subdomains.forEach((subdomain) => {
                    console.log(colors.yellow(`- Subdomain: ${subdomain.name}`));
                    console.log(colors.cyan(`\tType: ${subdomain.type}`));
                    console.log(colors.magenta(`\tValue: ${subdomain.value}`));
                    console.log(colors.gray(`\tCreated At: ${subdomain.created_at}`));
                    console.log();
                });
            } else {
                console.log(colors.red.bold('Failed to retrieve subdomains or no subdomains found.'));
            }
        } catch (error) {
            console.error(colors.red.bold('Failed to list subdomains.'));
        }
    });




program.parse();
