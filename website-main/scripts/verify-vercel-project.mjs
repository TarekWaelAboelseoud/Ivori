#!/usr/bin/env node
/**
 * Pre-deploy guard: ensure this repo is linked to the correct Vercel project.
 * Run: npm run verify:vercel
 */
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const projectFile = resolve(root, '.vercel', 'project.json')

const EXPECTED_PROJECT = 'shopify-cro'
const EXPECTED_PROJECT_ID = 'prj_JcBbLeNegdFqi26upTICrCh6kbYM'

if (!existsSync(projectFile)) {
  console.error('❌ .vercel/project.json not found.')
  console.error('   Run: npx vercel link')
  console.error(`   Select project: ${EXPECTED_PROJECT}`)
  process.exit(1)
}

let config
try {
  config = JSON.parse(readFileSync(projectFile, 'utf8'))
} catch {
  console.error('❌ Could not parse .vercel/project.json')
  process.exit(1)
}

const name = config.projectName ?? config.name
const id = config.projectId

if (name !== EXPECTED_PROJECT && id !== EXPECTED_PROJECT_ID) {
  console.error(`❌ Wrong Vercel project linked: "${name ?? id}"`)
  console.error(`   Expected: ${EXPECTED_PROJECT} (${EXPECTED_PROJECT_ID})`)
  console.error('   Do NOT deploy to project-0f2s1 — ivoridigitals.com must track shopify-cro.')
  console.error('   Fix: npx vercel link → choose shopify-cro')
  process.exit(1)
}

console.log(`✓ Vercel project OK: ${name ?? EXPECTED_PROJECT}`)
