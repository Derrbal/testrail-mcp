#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Patterns to detect secrets
const SECRET_PATTERNS = [
  // API Keys (20+ characters, alphanumeric with dots/dashes)
  {
    name: 'API Key',
    pattern: /(?:api[_-]?key|secret|token).*?=.*?['"`]?[a-zA-Z0-9._-]{20,}['"`]?/gi,
    severity: 'HIGH'
  },
  // API Keys in object properties
  {
    name: 'API Key Property',
    pattern: /(?:api[_-]?key|secret|token).*?:.*?['"`]?[a-zA-Z0-9._-]{20,}['"`]?/gi,
    severity: 'HIGH'
  },
  // Email addresses in config contexts
  {
    name: 'Email in Config',
    pattern: /(?:username|user|email).*?=.*?['"`]?[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}['"`]?/gi,
    severity: 'MEDIUM'
  },
  // URLs with potential instance names
  {
    name: 'Instance URL',
    pattern: /(?:url|base_url).*?=.*?['"`]?https?:\/\/[a-zA-Z0-9.-]+\.testrail\.io['"`]?/gi,
    severity: 'LOW'
  },
  // Generic password patterns
  {
    name: 'Password',
    pattern: /(?:password|passwd|pwd).*?=.*?['"`]?[^'"`\s]+['"`]?/gi,
    severity: 'HIGH'
  }
];

// Files to exclude
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.env$/,
  /example\.env$/,
  /package-lock\.json$/,
  /\.gitleaks\.toml$/,
  /dist[\/\\]/,
  /\.js\.map$/,
  /scripts[\/\\]security-scan\.js$/
];

// Allowlist patterns (safe to ignore)
const ALLOWLIST_PATTERNS = [
  /<your-testrail-username>/,
  /<your-testrail-api-key>/,
  /your-email@example\.com/,
  /your-api-key-here/,
  /https:\/\/your-instance\.testrail\.io/,
  /https:\/\/your-domain\.testrail\.io/,
  /\[REDACTED\]/,
  /placeholder/,
  /example\.com/,
  /config\.TESTRAIL_API_KEY/,
  /TESTRAIL_API_KEY:/,
  /password: config\./,
  /password\|passwd\|pwd/,
  /TESTRAIL_API_KEY.*?=.*?config\./,
  /password.*?=.*?config\./,
  /w\.TESTRAIL_API_KEY/,
  /P\.z\.string\(\)/,
  /\.min\(1\)/,
  /process\.env\.TESTRAIL_API_KEY/,
  /process\.env\.TESTRAIL_USERNAME/,
  /"<your-testrail-api-key>"/,
  /"<your-testrail-username>"/,
  /API_KEY.*?<your-testrail-api-key/,
  /API_KEY.*?your_testrail_api_key/
];

function shouldExcludeFile(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

function isAllowlisted(content) {
  return ALLOWLIST_PATTERNS.some(pattern => pattern.test(content));
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    SECRET_PATTERNS.forEach(({ name, pattern, severity }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (!isAllowlisted(match)) {
            issues.push({
              file: filePath,
              pattern: name,
              match: match.substring(0, 50) + (match.length > 50 ? '...' : ''),
              severity,
              line: content.split('\n').findIndex(line => line.includes(match)) + 1
            });
          }
        });
      }
    });

    return issues;
  } catch (error) {
    console.warn(`Warning: Could not read ${filePath}: ${error.message}`);
    return [];
  }
}

function scanDirectory(dirPath) {
  const allIssues = [];

  function scanRecursive(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!shouldExcludeFile(fullPath)) {
            scanRecursive(fullPath);
          }
        } else if (stat.isFile()) {
          if (!shouldExcludeFile(fullPath)) {
            const issues = scanFile(fullPath);
            allIssues.push(...issues);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan ${currentPath}: ${error.message}`);
    }
  }

  scanRecursive(dirPath);
  return allIssues;
}

function main() {
  console.log('🔍 Running security scan...\n');
  
  const startTime = Date.now();
  const issues = scanDirectory('.');
  const scanTime = Date.now() - startTime;

  if (issues.length === 0) {
    console.log('✅ No security issues found!');
    console.log(`⏱️  Scan completed in ${scanTime}ms`);
    process.exit(0);
  }

  console.log(`❌ Found ${issues.length} potential security issue(s):\n`);

  // Group by severity
  const bySeverity = {
    HIGH: issues.filter(i => i.severity === 'HIGH'),
    MEDIUM: issues.filter(i => i.severity === 'MEDIUM'),
    LOW: issues.filter(i => i.severity === 'LOW')
  };

  ['HIGH', 'MEDIUM', 'LOW'].forEach(severity => {
    const severityIssues = bySeverity[severity];
    if (severityIssues.length > 0) {
      console.log(`${severity === 'HIGH' ? '🔴' : severity === 'MEDIUM' ? '🟡' : '🟢'} ${severity} (${severityIssues.length}):`);
      severityIssues.forEach(issue => {
        console.log(`  ${issue.file}:${issue.line} - ${issue.pattern}`);
        console.log(`    ${issue.match}`);
      });
      console.log('');
    }
  });

  console.log(`⏱️  Scan completed in ${scanTime}ms`);
  
  if (bySeverity.HIGH.length > 0) {
    console.log('\n🚨 CRITICAL: High severity issues found! Please fix immediately.');
    process.exit(1);
  } else if (bySeverity.MEDIUM.length > 0) {
    console.log('\n⚠️  WARNING: Medium severity issues found. Review and fix as needed.');
    process.exit(1);
  } else {
    console.log('\nℹ️  Only low severity issues found. Consider reviewing.');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { scanDirectory, scanFile };
