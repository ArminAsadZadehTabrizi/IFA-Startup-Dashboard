#!/usr/bin/env node

/**
 * Check Environment Variables for Chatbot
 * 
 * This script checks if all required environment variables are properly set
 * for the chatbot to function correctly.
 */

const fs = require('fs')
const path = require('path')

console.log('\n🔍 Checking Chatbot Environment Configuration...\n')

// Load .env.local if it exists
const envPath = path.join(process.cwd(), '.env.local')
let envExists = false

try {
  envExists = fs.existsSync(envPath)
  
  if (envExists) {
    console.log('✅ .env.local file found')
    try {
      const envContent = fs.readFileSync(envPath, 'utf-8')
      
      // Parse env file manually
      const lines = envContent.split('\n')
      lines.forEach(line => {
        const trimmedLine = line.trim()
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=')
          const value = valueParts.join('=')
          if (key && value) {
            process.env[key] = value
          }
        }
      })
    } catch (readError) {
      console.log('⚠️  Could not read .env.local file (permission issue)')
      console.log('   Checking system environment variables instead...\n')
    }
  } else {
    console.log('⚠️  .env.local file not found')
    console.log('   Create it by copying env.local.example:')
    console.log('   cp env.local.example .env.local\n')
  }
} catch (error) {
  console.log('⚠️  Could not access .env.local (may not exist or permission issue)')
  console.log('   Checking system environment variables instead...\n')
}

// Check required variables
const checks = [
  {
    name: 'LLM Provider',
    key: 'LLM_PROVIDER',
    required: false,
    defaultValue: 'gemini',
    description: 'Which LLM to use (gemini or openai)'
  },
  {
    name: 'Gemini API Key',
    key: 'GEMINI_API_KEY',
    required: true,
    fallbackKey: 'GOOGLE_AI_API_KEY',
    description: 'API key for Google Gemini AI (get it from https://ai.google.dev/)'
  },
  {
    name: 'Gemini Model',
    key: 'GEMINI_MODEL',
    required: false,
    defaultValue: 'gemini-2.5-flash',
    description: 'Which Gemini model to use'
  },
  {
    name: 'OpenAI API Key',
    key: 'OPENAI_API_KEY',
    required: false,
    description: 'API key for OpenAI (only needed if LLM_PROVIDER=openai)'
  },
]

let hasErrors = false
let hasWarnings = false

checks.forEach(check => {
  const value = process.env[check.key]
  const fallbackValue = check.fallbackKey ? process.env[check.fallbackKey] : null
  const actualValue = value || fallbackValue
  
  if (actualValue) {
    // Mask the API key (show first 8 and last 4 characters)
    const masked = actualValue.length > 12 
      ? `${actualValue.substring(0, 8)}...${actualValue.substring(actualValue.length - 4)}`
      : '***masked***'
    
    console.log(`✅ ${check.name}`)
    console.log(`   ${check.key}: ${masked}`)
    if (fallbackValue && !value) {
      console.log(`   (using fallback: ${check.fallbackKey})`)
    }
  } else if (check.required) {
    console.log(`❌ ${check.name}`)
    console.log(`   ${check.key}: NOT SET`)
    console.log(`   ${check.description}`)
    hasErrors = true
  } else {
    console.log(`⚠️  ${check.name}`)
    console.log(`   ${check.key}: NOT SET (using default: ${check.defaultValue || 'none'})`)
    console.log(`   ${check.description}`)
    hasWarnings = true
  }
  console.log('')
})

// Summary
console.log('\n' + '='.repeat(60))
if (hasErrors) {
  console.log('❌ Configuration has ERRORS - chatbot will not work!')
  console.log('\nPlease set the required environment variables in .env.local')
  console.log('See env.local.example for reference.\n')
  process.exit(1)
} else if (hasWarnings) {
  console.log('⚠️  Configuration has warnings - using defaults')
  console.log('✅ Chatbot should work with current configuration\n')
  process.exit(0)
} else {
  console.log('✅ All environment variables are properly configured!')
  console.log('🚀 Chatbot is ready to use\n')
  process.exit(0)
}

