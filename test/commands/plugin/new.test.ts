import {expect, test} from '@oclif/test'

describe('plugin:new', () => {
  test
  .stdout()
  .command(['plugin:new'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['plugin:new', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
