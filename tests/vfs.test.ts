import { parseCaptionToPath } from '../src/lib/vfs';

test('parses valid YourDrive caption', () => {
    const caption = '[YourDrive-Meta: {"path": "/Documents", "name": "test.txt"}]';
    expect(parseCaptionToPath(caption)).toEqual({ path: '/Documents', name: 'test.txt' });
});

test('returns null for invalid caption', () => {
    expect(parseCaptionToPath('just a normal message')).toBeNull();
});
