import * as core from '@actions/core'
import {readFileSync} from 'fs'
import {join} from 'path'
import axios from 'axios'

async function run(): Promise<void> {
  const cwd = core.getInput('cwd') || '.'
  const packagePath = join(cwd, 'package.json')
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))

  try {
    const npmInfo = await axios({
      url: `https://registry.npmjs.org/${pkg.name}`,
      method: 'GET'
    })
    if (!npmInfo.data || !npmInfo.data._id) {
      throw new Error('Got a bad response from npm')
    }
    if (pkg.version > npmInfo.data.version) core.setOutput('should-deploy', 'true')
  } catch (error) {
    core.setFailed(`${pkg.name} is a new package, you need to have deployed at least once`)
  }
}

run()
