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
    const shouldDeploy = pkg.version > npmInfo.data.version
    if (shouldDeploy) {
      core.setOutput('deploy', 'true')
      core.info('Recommending a deploy')
    } else {
      core.info(`Not recommending a a deploy because ${pkg.version} < ${npmInfo.data.version}`)
    }
  } catch (error) {
    core.setFailed(`${pkg.name} is a new package, you need to have deployed at least once`)
  }
}

run()
