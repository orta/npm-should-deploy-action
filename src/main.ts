import * as core from '@actions/core'
import {readFileSync} from 'fs'
import {join} from 'path'
import axios from 'axios'
import semver = require('semver')

async function run(): Promise<void> {
  const cwd = core.getInput('cwd') || '.'
  const npmTag = core.getInput('npmTag') || 'latest'

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
    const theirVersion = npmInfo.data['dist-tags'][npmTag]
    const shouldDeploy = semver.gt(pkg.version, theirVersion)
    if (shouldDeploy) {
      core.setOutput('deploy', 'true')
      core.info('Recommending a deploy')
    } else {
      core.info(`Not recommending a a deploy because ${pkg.version} < ${theirVersion}`)
    }
  } catch (error) {
    core.setFailed(`${pkg.name} is a new package, you need to have deployed at least once`)
  }
}

run()
