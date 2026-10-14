"""Ensure saved expression drills are playable before the deferred fetch finishes."""
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
spec = importlib.util.spec_from_file_location('app_build', ROOT / 'build.py')
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)

class StarterDataTests(unittest.TestCase):
    def test_all_top_500_forms_are_available_without_extra_data(self):
        source = (ROOT / build.FRENCH_WEB_DATA_SOURCE).read_text()
        verbs = build.extract_json_const_assignment(source, 'verbs')
        full = build.extract_json_const_assignment(source, 'tenses')
        with tempfile.TemporaryDirectory() as directory:
            old = build.APP_DIST_DIR
            try:
                build.APP_DIST_DIR = directory
                build.write_french_split_verb_data('test')
                starter = build.extract_json_const_assignment(
                    (Path(directory) / build.FRENCH_WEB_STARTER_DATA_ASSET).read_text(), 'tenses')
                extra = json.loads((Path(directory) / build.FRENCH_WEB_EXTRA_DATA_ASSET).read_text())['tenses']
            finally:
                build.APP_DIST_DIR = old
        expressions = 0
        for verb in verbs:
            if verb.get('frequency', '').replace('-', '') not in {'top20','top50','top100','top500'}:
                continue
            expressions += bool(verb.get('verbExpression'))
            for tense, forms in full.items():
                if verb['infinitive'] in forms:
                    self.assertEqual(starter[tense].get(verb['infinitive']), forms[verb['infinitive']], (tense, verb['infinitive']))
        self.assertGreater(expressions, 200)
        for tense, forms in full.items():
            self.assertEqual({**starter[tense], **extra[tense]}, forms)
            self.assertFalse(starter[tense].keys() & extra[tense].keys())

if __name__ == '__main__': unittest.main()
