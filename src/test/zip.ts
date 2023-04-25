/*
 * This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild
 */
import KaitaiStream from 'kaitai-struct/KaitaiStream'

/**
 * ZIP is a popular archive file format, introduced in 1989 by Phil Katz
 * and originally implemented in PKZIP utility by PKWARE.
 * 
 * Thanks to solid support of it in most desktop environments and
 * operating systems, and algorithms / specs availability in public
 * domain, it quickly became tool of choice for implementing file
 * containers.
 * 
 * For example, Java .jar files, OpenDocument, Office Open XML, EPUB files
 * are actually ZIP archives.
 * @see {@link https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT|Source}
 */

export class Zip {
  _is_le?: boolean;

  constructor(
    readonly _io: KaitaiStream,
    readonly _parent?: unknown,
    readonly _root?: Zip,
  ) {
    this._root ??= this;

    this._read();
  }

  _read() {
    this.sections = [];
    let i = 0;
    while (!this._io.isEof()) {
      this.sections.push(new Zip.PkSection(this._io, this, this._root));
      i++;
    }
  }

  sections: Array<Zip.PkSection>;
}

export namespace Zip {
  export class LocalFile {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: Zip.PkSection,
      readonly _root?: Zip,
    ) {

      this._read();
    }

    _read() {
      this.header = (new Zip.LocalFileHeader(this._io, this, this._root)) as any
      this.body = (this._io.readBytes((this.header as any).lenBodyCompressed)) as any
    }

    header: Zip.LocalFileHeader;
    body: Uint8Array;
  }
}

export namespace Zip {
  export class DataDescriptor {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: Zip.PkSection,
      readonly _root?: Zip,
    ) {

      this._read();
    }

    _read() {
      this.crc32 = (this._io.readU4le()) as any
      this.lenBodyCompressed = (this._io.readU4le()) as any
      this.lenBodyUncompressed = (this._io.readU4le()) as any
    }

    crc32: number;
    lenBodyCompressed: number;
    lenBodyUncompressed: number;
  }
}

export namespace Zip {
  export class ExtraField {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: Zip.Extras,
      readonly _root?: Zip,
    ) {

      this._read();
    }

    _read() {
      this.code = (this._io.readU2le()) as any
      this.lenBody = (this._io.readU2le()) as any
      switch ((this.code as any)) {
        case Zip.ExtraCodes.NTFS: {
          this._raw_body = (this._io.readBytes((this.lenBody as any))) as any
          let _io__raw_body = new KaitaiStream(this._raw_body);
          this.body = (new Zip.ExtraField.Ntfs(_io__raw_body, this, this._root)) as any
          break;
        }
        case Zip.ExtraCodes.EXTENDED_TIMESTAMP: {
          this._raw_body = (this._io.readBytes((this.lenBody as any))) as any
          let _io__raw_body = new KaitaiStream(this._raw_body);
          this.body = (new Zip.ExtraField.ExtendedTimestamp(_io__raw_body, this, this._root)) as any
          break;
        }
        case Zip.ExtraCodes.INFOZIP_UNIX_VAR_SIZE: {
          this._raw_body = (this._io.readBytes((this.lenBody as any))) as any
          let _io__raw_body = new KaitaiStream(this._raw_body);
          this.body = (new Zip.ExtraField.InfozipUnixVarSize(_io__raw_body, this, this._root)) as any
          break;
        }
        default: {
          this.body = (this._io.readBytes((this.lenBody as any))) as any
          break;
        }
      }
    }

    code: Zip.ExtraCodes;
    lenBody: number;
    body: Zip.ExtraField.Ntfs | Zip.ExtraField.ExtendedTimestamp | Zip.ExtraField.InfozipUnixVarSize | Uint8Array;
    _raw_body: Uint8Array;
  }
}

/**
 * @see {@link https://github.com/LuaDist/zip/blob/master/proginfo/extrafld.txt#L191|Source}
 */

export namespace Zip.ExtraField {
  export class Ntfs {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: Zip.ExtraField,
      readonly _root?: Zip,
    ) {

      this._read();
    }

    _read() {
      this.reserved = (this._io.readU4le()) as any
      this.attributes = [];
      let i = 0;
      while (!this._io.isEof()) {
        this.attributes.push(new Zip.ExtraField.Ntfs.Attribute(this._io, this, this._root));
        i++;
      }
    }

    reserved: number;
    attributes: Array<Zip.ExtraField.Ntfs.Attribute>;
  }
}

export namespace Zip.ExtraField.Ntfs {
  export class Attribute {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: Zip.ExtraField.Ntfs,
      readonly _root?: Zip,
    ) {

      this._read();
    }

    _read() {
      this.tag = (this._io.readU2le()) as any
      this.lenBody = (this._io.readU2le()) as any
      switch ((this.tag as any)) {
        case 1: {
          this._raw_body = (this._io.readBytes((this.lenBody as any))) as any
          let _io__raw_body = new KaitaiStream(this._raw_body);
          this.body = (new Zip.ExtraField.Ntfs.Attribute1(_io__raw_body, this, this._root)) as any
          break;
        }
        default: {
          this.body = (this._io.readBytes((this.lenBody as any))) as any
          break;
        }
      }
    }

    tag: number;
    lenBody: number;
    body: Zip.ExtraField.Ntfs.Attribute1 | Uint8Array;
    _raw_body: Uint8Array;
  }
}

export namespace Zip.ExtraField.Ntfs {
  export class Attribute1 {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: Zip.ExtraField.Ntfs.Attribute,
      readonly _root?: Zip,
    ) {

      this._read();
    }

    _read() {
      this.lastModTime = (this._io.readU8le()) as any
      this.lastAccessTime = (this._io.readU8le()) as any
      this.creationTime = (this._io.readU8le()) as any
    }

    lastModTime: number;
    lastAccessTime: number;
    creationTime: number;
  }
}

/**
 * @see {@link https://github.com/LuaDist/zip/blob/master/proginfo/extrafld.txt#L817|Source}
 */

export namespace Zip.ExtraField {
  export class ExtendedTimestamp {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: Zip.ExtraField,
      readonly _root?: Zip,
    ) {

      this._read();
    }

    _read() {
      this.flags = (this._io.readU1()) as any
      this.modTime = (this._io.readU4le()) as any
      if (!((this._io as any).isEof())) {
        this.accessTime = (this._io.readU4le()) as any
      }
      if (!((this._io as any).isEof())) {
        this.createTime = (this._io.readU4le()) as any
      }
    }

    flags: number;
    modTime: number;
    accessTime: number | undefined;
    createTime: number | undefined;
  }
}

/**
 * @see {@link https://github.com/LuaDist/zip/blob/master/proginfo/extrafld.txt#L1339|Source}
 */

export namespace Zip.ExtraField {
  export class InfozipUnixVarSize {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: Zip.ExtraField,
      readonly _root?: Zip,
    ) {

      this._read();
    }

    _read() {
      this.version = (this._io.readU1()) as any
      this.lenUid = (this._io.readU1()) as any
      this.uid = (this._io.readBytes((this.lenUid as any))) as any
      this.lenGid = (this._io.readU1()) as any
      this.gid = (this._io.readBytes((this.lenGid as any))) as any
    }


    /**
     * Version of this extra field, currently 1
     */
    version: number;

    /**
     * Size of UID field
     */
    lenUid: number;

    /**
     * UID (User ID) for a file
     */
    uid: Uint8Array;

    /**
     * Size of GID field
     */
    lenGid: number;

    /**
     * GID (Group ID) for a file
     */
    gid: Uint8Array;
  }
}

/**
 * @see {@link https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT|- 4.3.12}
 */

export namespace Zip {
  export class CentralDirEntry {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: Zip.PkSection,
      readonly _root?: Zip,
    ) {

      this._read();
    }

    _read() {
      this.versionMadeBy = (this._io.readU2le()) as any
      this.versionNeededToExtract = (this._io.readU2le()) as any
      this.flags = (this._io.readU2le()) as any
      this.compressionMethod = (this._io.readU2le()) as any
      this.lastModFileTime = (this._io.readU2le()) as any
      this.lastModFileDate = (this._io.readU2le()) as any
      this.crc32 = (this._io.readU4le()) as any
      this.lenBodyCompressed = (this._io.readU4le()) as any
      this.lenBodyUncompressed = (this._io.readU4le()) as any
      this.lenFileName = (this._io.readU2le()) as any
      this.lenExtra = (this._io.readU2le()) as any
      this.lenComment = (this._io.readU2le()) as any
      this.diskNumberStart = (this._io.readU2le()) as any
      this.intFileAttr = (this._io.readU2le()) as any
      this.extFileAttr = (this._io.readU4le()) as any
      this.ofsLocalHeader = (this._io.readS4le()) as any
      this.fileName = (KaitaiStream.bytesToStr(this._io.readBytes((this.lenFileName as any)), "UTF-8")) as any
      this._raw_extra = (this._io.readBytes((this.lenExtra as any))) as any
      let _io__raw_extra = new KaitaiStream(this._raw_extra);
      this.extra = (new Zip.Extras(_io__raw_extra, this, this._root)) as any
      this.comment = (KaitaiStream.bytesToStr(this._io.readBytes((this.lenComment as any)), "UTF-8")) as any
    }

    private _localHeader: Zip.PkSection;
    get localHeader(): Zip.PkSection {
      if (typeof this._localHeader !== 'undefined')
        return this._localHeader;
      let _pos = this._io.pos;
      this._io.seek((this.ofsLocalHeader as any));
      this._localHeader = (new Zip.PkSection(this._io, this, this._root)) as any
      this._io.seek(_pos);
      return this._localHeader;
    }

    versionMadeBy: number;
    versionNeededToExtract: number;
    flags: number;
    compressionMethod: Zip.Compression;
    lastModFileTime: number;
    lastModFileDate: number;
    crc32: number;
    lenBodyCompressed: number;
    lenBodyUncompressed: number;
    lenFileName: number;
    lenExtra: number;
    lenComment: number;
    diskNumberStart: number;
    intFileAttr: number;
    extFileAttr: number;
    ofsLocalHeader: number;
    fileName: string;
    extra: Zip.Extras;
    comment: string;
    _raw_extra: Uint8Array;
  }
}

export namespace Zip {
  export class PkSection {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: unknown,
      readonly _root?: Zip,
    ) {

      this._read();
    }

    _read() {
      this.magic = (this._io.readBytes(2)) as any
      if (!((KaitaiStream.byteArrayCompare((this.magic as any), [80, 75]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([80, 75], (this.magic as any), (this._io as any), "/types/pk_section/seq/0");
      }
      this.sectionType = (this._io.readU2le()) as any
      switch ((this.sectionType as any)) {
        case 513: {
          this.body = (new Zip.CentralDirEntry(this._io, this, this._root)) as any
          break;
        }
        case 1027: {
          this.body = (new Zip.LocalFile(this._io, this, this._root)) as any
          break;
        }
        case 1541: {
          this.body = (new Zip.EndOfCentralDir(this._io, this, this._root)) as any
          break;
        }
        case 2055: {
          this.body = (new Zip.DataDescriptor(this._io, this, this._root)) as any
          break;
        }
      }
    }

    magic: Uint8Array;
    sectionType: number;
    body: Zip.CentralDirEntry | undefined | Zip.LocalFile | undefined | Zip.EndOfCentralDir | undefined | Zip.DataDescriptor | undefined | undefined;
  }
}

export namespace Zip {
  export class Extras {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: unknown,
      readonly _root?: Zip,
    ) {

      this._read();
    }

    _read() {
      this.entries = [];
      let i = 0;
      while (!this._io.isEof()) {
        this.entries.push(new Zip.ExtraField(this._io, this, this._root));
        i++;
      }
    }

    entries: Array<Zip.ExtraField>;
  }
}

export namespace Zip {
  export class LocalFileHeader {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: Zip.LocalFile,
      readonly _root?: Zip,
    ) {

      this._read();
    }

    _read() {
      this.version = (this._io.readU2le()) as any
      this.flags = (this._io.readU2le()) as any
      this.compressionMethod = (this._io.readU2le()) as any
      this.fileModTime = (this._io.readU2le()) as any
      this.fileModDate = (this._io.readU2le()) as any
      this.crc32 = (this._io.readU4le()) as any
      this.lenBodyCompressed = (this._io.readU4le()) as any
      this.lenBodyUncompressed = (this._io.readU4le()) as any
      this.lenFileName = (this._io.readU2le()) as any
      this.lenExtra = (this._io.readU2le()) as any
      this.fileName = (KaitaiStream.bytesToStr(this._io.readBytes((this.lenFileName as any)), "UTF-8")) as any
      this._raw_extra = (this._io.readBytes((this.lenExtra as any))) as any
      let _io__raw_extra = new KaitaiStream(this._raw_extra);
      this.extra = (new Zip.Extras(_io__raw_extra, this, this._root)) as any
    }

    version: number;
    flags: number;
    compressionMethod: Zip.Compression;
    fileModTime: number;
    fileModDate: number;
    crc32: number;
    lenBodyCompressed: number;
    lenBodyUncompressed: number;
    lenFileName: number;
    lenExtra: number;
    fileName: string;
    extra: Zip.Extras;
    _raw_extra: Uint8Array;
  }
}

export namespace Zip {
  export class EndOfCentralDir {
    _is_le?: boolean;

    constructor(
      readonly _io: KaitaiStream,
      readonly _parent?: Zip.PkSection,
      readonly _root?: Zip,
    ) {

      this._read();
    }

    _read() {
      this.diskOfEndOfCentralDir = (this._io.readU2le()) as any
      this.diskOfCentralDir = (this._io.readU2le()) as any
      this.numCentralDirEntriesOnDisk = (this._io.readU2le()) as any
      this.numCentralDirEntriesTotal = (this._io.readU2le()) as any
      this.lenCentralDir = (this._io.readU4le()) as any
      this.ofsCentralDir = (this._io.readU4le()) as any
      this.lenComment = (this._io.readU2le()) as any
      this.comment = (KaitaiStream.bytesToStr(this._io.readBytes((this.lenComment as any)), "UTF-8")) as any
    }

    diskOfEndOfCentralDir: number;
    diskOfCentralDir: number;
    numCentralDirEntriesOnDisk: number;
    numCentralDirEntriesTotal: number;
    lenCentralDir: number;
    ofsCentralDir: number;
    lenComment: number;
    comment: string;
  }
}
export namespace Zip {
  export enum Compression {
    NONE = 0,
    SHRUNK = 1,
    REDUCED_1 = 2,
    REDUCED_2 = 3,
    REDUCED_3 = 4,
    REDUCED_4 = 5,
    IMPLODED = 6,
    DEFLATED = 8,
    ENHANCED_DEFLATED = 9,
    PKWARE_DCL_IMPLODED = 10,
    BZIP2 = 12,
    LZMA = 14,
    IBM_TERSE = 18,
    IBM_LZ77_Z = 19,
    PPMD = 98,
  }
}
export namespace Zip {
  export enum ExtraCodes {
    ZIP64 = 1,
    AV_INFO = 7,
    OS2 = 9,
    NTFS = 10,
    OPENVMS = 12,
    PKWARE_UNIX = 13,
    FILE_STREAM_AND_FORK_DESCRIPTORS = 14,
    PATCH_DESCRIPTOR = 15,
    PKCS7 = 20,
    X509_CERT_ID_AND_SIGNATURE_FOR_FILE = 21,
    X509_CERT_ID_FOR_CENTRAL_DIR = 22,
    STRONG_ENCRYPTION_HEADER = 23,
    RECORD_MANAGEMENT_CONTROLS = 24,
    PKCS7_ENC_RECIP_CERT_LIST = 25,
    IBM_S390_UNCOMP = 101,
    IBM_S390_COMP = 102,
    POSZIP_4690 = 18064,
    EXTENDED_TIMESTAMP = 21589,
    INFOZIP_UNIX = 30805,
    INFOZIP_UNIX_VAR_SIZE = 30837,
  }
}
