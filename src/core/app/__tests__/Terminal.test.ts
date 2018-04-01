import chalk from 'chalk';
import { factory } from './Terminal.mock';

describe('Terminal', () => {
  it('Should be handle production mode', () => {
    const { stdout, stderr, term, clear } = factory(false, false);

    term.echo('foo', 'bar', 'baz');
    expect(stdout.list).toHaveLength(1);
    expect(stdout.list[0]).toBe('foo bar baz\n');
    expect(stderr.list).toHaveLength(0);
    clear();

    term.log('title', 'foo');
    expect(stdout.list).toHaveLength(0);
    expect(stderr.list).toHaveLength(0);
    clear();

    term.section('cyan', 'TITLE', 'hoge fuga');
    expect(stdout.list).toHaveLength(3);
    expect(stdout.list[2]).toContain(`${chalk.black.bgCyan(' TITLE ')} hoge fuga`);
    expect(stderr.list).toHaveLength(0);
    clear();

    term.blank();
    expect(stdout.list).toHaveLength(1);
    expect(stdout.list[0]).toBe('\n');
    expect(stderr.list).toHaveLength(0);
    clear();

    term.clear();
    expect(stdout.list).toHaveLength(2);
    expect(stdout.list[1]).toContain('0f');
    expect(stderr.list).toHaveLength(0);
    clear();

    term.error('error message');
    expect(stdout.list).toHaveLength(0);
    expect(stderr.list).toHaveLength(1);
    expect(stderr.list[0]).toContain(`${chalk.black.bgRed(' ERROR ')} error message`);
    clear();
  });

  it('Should be handle silent mode', () => {
    const { stdout, stderr, term, clear } = factory(true, false);

    term.echo('foo', 'bar', 'baz');
    expect(stdout.list).toHaveLength(0);
    expect(stderr.list).toHaveLength(0);
    clear();

    term.log('title', 'foo');
    expect(stdout.list).toHaveLength(0);
    expect(stderr.list).toHaveLength(0);
    clear();

    term.section('cyan', 'TITLE', 'hoge fuga');
    expect(stdout.list).toHaveLength(0);
    expect(stderr.list).toHaveLength(0);
    clear();

    term.blank();
    expect(stdout.list).toHaveLength(0);
    expect(stderr.list).toHaveLength(0);
    clear();

    term.clear();
    expect(stdout.list).toHaveLength(0);
    expect(stderr.list).toHaveLength(0);
    clear();

    term.error('error message');
    expect(stdout.list).toHaveLength(0);
    expect(stderr.list).toHaveLength(1);
    clear();
  });

  it('Should be handle debug mode', () => {
    const { stdout, stderr, term, clear } = factory(false, true);

    term.echo('foo', 'bar', 'baz');
    expect(stdout.list).toHaveLength(1);
    expect(stderr.list).toHaveLength(0);
    clear();

    term.log('title', 'foo');
    expect(stdout.list).toHaveLength(1);
    expect(stdout.list[0]).toBe(`${chalk.black.bgBlue(' DEBUG ')} ${chalk.blue('[title]')} foo\n`);
    expect(stderr.list).toHaveLength(0);
    clear();

    term.section('cyan', 'TITLE', 'hoge fuga');
    expect(stdout.list).toHaveLength(3);
    expect(stderr.list).toHaveLength(0);
    clear();

    term.blank();
    expect(stdout.list).toHaveLength(1);
    expect(stderr.list).toHaveLength(0);
    clear();

    term.clear();
    expect(stdout.list).toHaveLength(2);
    expect(stderr.list).toHaveLength(0);
    clear();

    term.error('error message');
    expect(stdout.list).toHaveLength(0);
    expect(stderr.list).toHaveLength(1);
    clear();
  });

  it('Should be handle progress counter', () => {
    let { stdout, term, clear } = factory(false, false, true);

    term.progressStart('', 10);
    expect(stdout.list).toHaveLength(1);
    expect(stdout.list[0]).toBe('   0/10 (0 %)\n');
    clear();

    for (let i = 0; i < 9; i += 1) {
      term.progressTick();
      expect(stdout.list).toHaveLength(i + 1);
      expect(stdout.list[i]).toBe(`   ${i + 1}/10 (${Math.floor(((i + 1) / 10) * 100)} %)\n`);
    }

    term.progressTick();
    expect(stdout.list).toHaveLength(10);
    expect(stdout.list[9]).toBe('  10/10 (100 %)\n');
    clear();

    term.progressStop();
    expect((term as any).progressCounter).toBeNull(); // tslint:disable-line: no-any
  });
});
