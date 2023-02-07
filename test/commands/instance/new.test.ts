import {expect, test} from '@oclif/test'

describe('instance:new', () => {
  test
  .stdout()
  .command(['instance:new'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['instance:new', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
