import test from 'ava';
import { encode } from './bencoding';

/*
 * Byte strings are encoded as follows:
 *     <string length encoded in base ten ASCII>:<string data>
 *
 * Note that there is no constant beginning delimiter, and no ending delimiter.
 */
test('encode strings', t => {
    t.is(encode('string', ''), '0:');
    t.not(encode('string', 'spam'), '3:spam');
    t.is(encode('string', 'spam'), '4:spam');
    t.not(encode('string', 'spam'), '5:spam');
});

/*
 * Integers are encoded as follows:
 *     i<integer encoded in base ten ASCII>e
 *
 * The initial i and trailing e are beginning and ending delimiters.
 *
 * i-0e is invalid. All encodings with a leading zero, such as i03e, are
 * invalid, other than i0e, which of course corresponds to the integer "0".
 *
 * NOTE: The maximum number of bit of this integer is unspecified, but to handle
 * it as a signed 64bit integer is mandatory to handle "large files" aka
 * .torrent for more that 4Gbyte.
 */
test('encode integers', t => {
    t.is(encode('integer', 0), `i0e`);
    t.is(encode('integer', -3), `i-3e`);
    t.is(encode('integer', 3), `i3e`);
    t.not(encode('integer', 3), `i03e`);
});

/*
 * Lists are encoded as follows:
 *     l<bencoded values>e
 *
 * The initial l and trailing e are beginning and ending delimiters. Lists may
 * contain any bencoded type, including integers, strings, dictionaries, and
 * even lists within other lists.
 */
test('encode lists', t => {
    t.is(encode('list', []), 'le');
    t.is(encode('list', ['spam', 'eggs']), `l4:spam4:eggse`);
    t.is(encode('list', ['spam', 1]), `l4:spami1ee`);
    t.is(encode('list', [1, 'spam']), `li1e4:spame`);
    t.is(encode('list', ['a', 'b']), `l1:a1:be`);
    t.throws(() => encode('list', [[]]));
    t.throws(() => encode('list', ''));
    t.throws(() => encode('list', 1));
});

/*
 * Dictionaries are encoded as follows:
 *     d<bencoded string><bencoded element>e
 *
 * The initial d and trailing e are the beginning and ending delimiters. Note
 * that the keys must be bencoded strings. The values may be any bencoded type,
 * including integers, strings, lists, and other dictionaries. Keys must be
 * strings and appear in sorted order (sorted as raw strings, not
 * alphanumerics). The strings should be compared using a binary comparison, not
 * a culture-specific "natural" comparison.
 */
test('encode dictionaries', t => {
    t.is(encode('dictionary', {}), 'de');
    t.is(encode('dictionary', { cow: 'moo', spam: 'eggs' }), 'd3:cow3:moo4:spam4:eggse');
    t.is(encode('dictionary', { spam: ['a', 'b'] }), 'd4:spaml1:a1:bee');
    t.is(
        encode('dictionary', { publisher: 'bob', 'publisher-webpage': 'www.example.com', 'publisher.location': 'home' }),
        'd9:publisher3:bob17:publisher-webpage15:www.example.com18:publisher.location4:homee',
    );
});
