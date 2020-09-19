import { EditorDefinition } from './EditorDefinition';
import { AtlaskitNoteEditor } from './atlassian-note-editor/AtlaskitNoteEditor';

export class EditorRegistry {
  private editors: EditorDefinition<any, any>[] = [];
  private static _instance: EditorRegistry;

  static get Instance() {
    if (!this._instance) {
      this._instance = new EditorRegistry();
    }
    return this._instance;
  }

  constructor() {
    this.registerEditor(new AtlaskitNoteEditor());
  }

  public registerEditor(editor: EditorDefinition<any, any>) {
    this.editors.push(editor);
    return this;
  }

  public getEditorWithId(id: string) {
    return this.editors.find(editor => editor.id === id);
  }
}