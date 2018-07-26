import { getFriend } from '@friends-library/friends';
import { convert } from '../../publish/asciidoc';
import { divide } from '../../publish/divide';
import { packageDocument } from '../package-document';

const rebecca = getFriend('rebecca-jones');

describe('packageDocument()', () => {

  let spec;
  let sections;

  beforeEach(() => {
    spec = {
      lang: 'en',
      friend: rebecca,
      document: rebecca.documents[0],
      edition: rebecca.documents[0].editions[0]
    };

    sections = [{
      id: 'sect1',
      html: 'foobar',
      isChapter: true,
      isFootnotes: false,
    }];
  });

  it('correctly sets language', () => {
    spec.lang = 'es';
    const xml = packageDocument(spec, sections);
    expect(xml).toContain('<dc:language id="pub-language">es</dc:language>');
  });

  it('contains the document title', () => {
    spec.document.title = 'Foobar baz';
    const xml = packageDocument(spec, sections);
    expect(xml).toContain('<dc:title id="pub-title">Foobar baz</dc:title>');
  });

  it('contains the friend author', () => {
    spec.document.title = 'Foobar baz';
    const xml = packageDocument(spec, sections);
    expect(xml).toContain('<dc:creator id="author">Rebecca Jones</dc:creator>');
  });

  it('contains the file-as meta tag', () => {
    const xml = packageDocument(spec, sections);
    expect(xml).toContain('<meta property="file-as" refines="#author">Jones, Rebecca</meta>');
  });

  it('must contain dc:terms modified', () => {
    spec.date = 1532465023;
    const xml = packageDocument(spec, sections);
    expect(xml).toContain('<meta property="dcterms:modified">2018-07-24T08:43:43Z</meta>');
  });

  test('uuid should be constructed to uniquely refer to ebook doc', () => {
    const uuid = 'friends-library/epub/en/rebecca-jones/life-letters/modernized';
    const xml = packageDocument(spec, sections);
    expect(xml).toContain(`<dc:identifier id="pub-id">${uuid}</dc:identifier>`)
  });

  test('one section produces one manifest resource and one spine item', () => {
    const xml = packageDocument(spec, sections);

    expect(xml).toContain('<item href="sect1.xhtml" media-type="application/xhtml+xml" id="sect1"/>')
    expect(xml.match(/<item href=/g).length).toBe(2); // one section, plus nav

    expect(xml).toContain('<itemref idref="sect1"/>');
  });

  test('footnotes go into named notes resource', () => {
    const html = convert('== Ch1\n\nFoobar.footnote:[lol]\n');
    const xml = packageDocument(spec, divide(html));

    expect(xml.match(/<itemref idref=/g).length).toBe(2); // chapter + notes
    expect(xml).toContain('<itemref idref="sect1"/>');
    expect(xml).toContain('<itemref idref="notes"/>');
  });
});

// test html gets <html>etc...
// test manifest > item[href] must end with .xhtml
// check all tags from lots of samples, read spec, profit
// escape xml!
