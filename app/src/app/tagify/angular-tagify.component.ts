import {
  AfterViewInit,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as Tagify from '@yaireo/tagify';
import { TagifyService } from './angular-tagify.service';

export interface SettingsModel {
  placeholder?: string;
  delimiters?: string;
  pattern?: string | RegExp;
  mode?: string;
  mixTagsInterpolator?: string[];
  mixTagsAllowedAfter?: RegExp;
  duplicates?: boolean;
  enforceWhitelist?: boolean;
  autoComplete?: {
    enabled?: boolean;
    rightKey?: boolean;
  };
  whitelist?: string[] | Object[];
  blacklist?: string[] | Object[];
  addTagOnBlur?: boolean;
  callbacks?: Object;
  maxTags?: number;
  editTags?: number;
  templates?: {
    wrapper?: Function;
    tag?: Function;
    dropdownItem?: Function;
    dropdownItemNoMatch?: Function;
  };
  transformTag?: Function;
  keepInvalidTags?: boolean;
  skipInvalid?: boolean;
  backspace?: any;
  originalInputValueFormat?: Function;
  dropdown?: {
    enabled?: number | false;
    caseSensitive?: boolean;
    maxItems?: number;
    classname?: string;
    fuzzySearch?: boolean;
    accentedSearch?: boolean;
    position?: string;
    highlightFirst?: boolean;
    closeOnSelect?: boolean;
    mapValueTo?: string | Function;
    searchKeys?: string[];
    appendTarget?: any;
  };
}

@Component({
  selector: 'tagify',
  template: `<input *ngIf="settings" #tagifyInputRef />`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagifyComponent),
      multi: true,
    },
  ],
})
export class TagifyComponent implements AfterViewInit, ControlValueAccessor {
  @Output() add = new EventEmitter(); // returns the added tag + updated tags list
  @Output() remove = new EventEmitter(); // returns the updated tags list
  @Input() settings: SettingsModel; // get possible tagify settings
  @Input() value: string | Array<string>;

  @ViewChild('tagifyInputRef') tagifyInputRef: any;

  private onChange: any = null;
  private onTouched: any = null;

  constructor(private tagifyService: TagifyService) {}
  private tagify;

  ngAfterViewInit() {
    if (!this.settings) {
      return;
    }
    this.settings.callbacks = {
      add: () => {
        this.add.emit({
          tags: this.tagify.value,
          added: this.tagify.value[this.tagify.value.length - 1],
        });

        if (this.onChange !== null) this.onChange(this.tagify.value);
      },
      remove: () => {
        this.remove.emit(this.tagify.value);

        if (this.onChange !== null) this.onChange(this.tagify.value);
      },
    };

    this.tagify = this.tagifyService.getTagifyRef(
      this.tagifyInputRef.nativeElement,
      this.settings,
    );

    if (this.value) {
      const value = this.value;
      setTimeout(() => this.addTags(value));
    }
  }

  ngOnChanges({ value }) {
    if (!this.tagify) return;
    if (!value.previousValue) {
      this.tagify.loadOriginalValues(value.currentValue);
    }
  }

  /**
   * @description removes all tags
   */
  removeAll() {
    this.tagify.removeAllTags();
  }

  /**
   * @description add multiple tags
   */
  addTags(tags) {
    this.tagify.addTags(tags);
  }

  /**
   * @description destroy dom and everything
   */
  destroy() {
    this.tagify.destroy();
  }

  writeValue(value) {
    if (value == null) return;
    this.value = value;

    if (!this.tagify)
      // Not yet rendered.
      return;

    this.removeAll();
    this.addTags(value as string[]);
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }
}
