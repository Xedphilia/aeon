import { NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { resolve } from 'path'

const REPO_ROOT = resolve(process.cwd(), '..')

export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params

    // Validate skill name to prevent injection
    if (!/^[a-z][a-z0-9-]*$/.test(name)) {
      return NextResponse.json({ error: 'Invalid skill name' }, { status: 400 })
    }

    // Read optional var from request body
    let skillVar = ''
    try {
      const body = await request.json()
      if (body.var && typeof body.var === 'string') {
        // Sanitize: only allow safe characters
        skillVar = body.var.replace(/[^a-zA-Z0-9_ .\-/#@]/g, '')
      }
    } catch { /* no body is fine */ }

    const cmd = skillVar
      ? `gh workflow run aeon.yml -f skill=${name} -f var=${JSON.stringify(skillVar)}`
      : `gh workflow run aeon.yml -f skill=${name}`

    execSync(cmd, { stdio: 'pipe', cwd: REPO_ROOT })

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to trigger run'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
