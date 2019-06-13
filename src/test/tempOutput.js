(function (KaitaiStream) {
var Rstm = (function() {
  Rstm.Endian = Object.freeze({
    BIG: 65279,
    LITTLE: 65534,

    65279: "BIG",
    65534: "LITTLE",
  });

  Rstm.Reftype = Object.freeze({
    ADDRESS: 0,
    OFFSET: 1,

    0: "ADDRESS",
    1: "OFFSET",
  });

  function Rstm(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;
    this._debug = {};

  }
  Rstm.prototype._read = function() {
    this._debug.header = { start: this._io.pos, ioOffset: this._io._byteOffset };
    this.header = new RstmHeader(this._io, this, this._root);
    this.header._read();
    this._debug.header.end = this._io.pos;
  }

  var Ruint = Rstm.Ruint = (function() {
    function Ruint(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;
      this._debug = {};

    }
    Ruint.prototype._read = function() {
      this._debug.refType = { start: this._io.pos, ioOffset: this._io._byteOffset, enumName: "Rstm.Reftype" };
      this.refType = this._io.readS1();
      this._debug.refType.end = this._io.pos;
      this._debug.dataType = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.dataType = this._io.readS1();
      this._debug.dataType.end = this._io.pos;
      this._debug.reserved = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.reserved = this._io.readU2be();
      this._debug.reserved.end = this._io.pos;
      this._debug.dataOffset = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.dataOffset = this._io.readS4be();
      this._debug.dataOffset.end = this._io.pos;
    }

    return Ruint;
  })();

  var BinTag = Rstm.BinTag = (function() {
    function BinTag(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;
      this._debug = {};

    }
    BinTag.prototype._read = function() {
      this._debug.tag = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.tag = KaitaiStream.bytesToStr(this._io.readBytes(4), "ASCII");
      this._debug.tag.end = this._io.pos;
    }

    return BinTag;
  })();

  var Data = Rstm.Data = (function() {
    function Data(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;
      this._debug = {};

    }
    Data.prototype._read = function() {
      this._debug.header = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.header = new Header(this._io, this, this._root);
      this.header._read();
      this._debug.header.end = this._io.pos;
    }

    var Header = Data.Header = (function() {
      function Header(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
        this._debug = {};

      }
      Header.prototype._read = function() {
        this._debug.tag = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.tag = this._io.readU4be();
        this._debug.tag.end = this._io.pos;
        this._debug.length = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.length = this._io.readS4be();
        this._debug.length.end = this._io.pos;
        this._debug.dataOffset = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.dataOffset = this._io.readS4be();
        this._debug.dataOffset.end = this._io.pos;
        this._debug.padding = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.padding = this._io.readBytes(20);
        this._debug.padding.end = this._io.pos;
      }

      return Header;
    })();

    var AdpcmData = Data.AdpcmData = (function() {
      function AdpcmData(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
        this._debug = {};

      }
      AdpcmData.prototype._read = function() {
        this._debug.channels = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.channels = new Array(this._root.rstmHead.chunk1.numChannels);
        this._debug.channels.arr = new Array(this._root.rstmHead.chunk1.numChannels);
        for (var i = 0; i < this._root.rstmHead.chunk1.numChannels; i++) {
          this._debug.channels.arr[i] = { start: this._io.pos, ioOffset: this._io._byteOffset };
          var _t_channels = new Channel(this._io, this, this._root);
          _t_channels._read();
          this.channels[i] = _t_channels;
          this._debug.channels.arr[i].end = this._io.pos;
        }
        this._debug.channels.end = this._io.pos;
      }

      var Channel = AdpcmData.Channel = (function() {
        function Channel(_io, _parent, _root) {
          this._io = _io;
          this._parent = _parent;
          this._root = _root || this;
          this._debug = {};

        }
        Channel.prototype._read = function() {
          this._debug.block = { start: this._io.pos, ioOffset: this._io._byteOffset };
          this.block = this._io.readBytes(this._root.rstmHead.chunk1.blockSize);
          this._debug.block.end = this._io.pos;
        }

        return Channel;
      })();

      return AdpcmData;
    })();

    var FinalBlocks = Data.FinalBlocks = (function() {
      function FinalBlocks(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
        this._debug = {};

      }
      FinalBlocks.prototype._read = function() {
        this._debug.channels = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.channels = new Array(this._root.rstmHead.chunk1.numChannels);
        this._debug.channels.arr = new Array(this._root.rstmHead.chunk1.numChannels);
        for (var i = 0; i < this._root.rstmHead.chunk1.numChannels; i++) {
          this._debug.channels.arr[i] = { start: this._io.pos, ioOffset: this._io._byteOffset };
          var _t_channels = new Channel(this._io, this, this._root);
          _t_channels._read();
          this.channels[i] = _t_channels;
          this._debug.channels.arr[i].end = this._io.pos;
        }
        this._debug.channels.end = this._io.pos;
      }

      var Channel = FinalBlocks.Channel = (function() {
        function Channel(_io, _parent, _root) {
          this._io = _io;
          this._parent = _parent;
          this._root = _root || this;
          this._debug = {};

        }
        Channel.prototype._read = function() {
          this._debug.finalBlock = { start: this._io.pos, ioOffset: this._io._byteOffset };
          this.finalBlock = this._io.readBytes(this._root.rstmHead.chunk1.finalBlockSizePadded);
          this._debug.finalBlock.end = this._io.pos;
        }

        return Channel;
      })();

      return FinalBlocks;
    })();
    Object.defineProperty(Data.prototype, 'adpcmData', {
      get: function() {
        if (this._m_adpcmData !== undefined)
          return this._m_adpcmData;
        var _pos = this._io.pos;
        this._io.seek(((this._root.header.dataOffset + 8) + this.header.dataOffset));
        this._debug._m_adpcmData = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this._m_adpcmData = new Array((this._root.rstmHead.chunk1.totalBlockCount - 1));
        this._debug._m_adpcmData.arr = new Array((this._root.rstmHead.chunk1.totalBlockCount - 1));
        for (var i = 0; i < (this._root.rstmHead.chunk1.totalBlockCount - 1); i++) {
          this._debug._m_adpcmData.arr[i] = { start: this._io.pos, ioOffset: this._io._byteOffset };
          var _t__m_adpcmData = new AdpcmData(this._io, this, this._root);
          _t__m_adpcmData._read();
          this._m_adpcmData[i] = _t__m_adpcmData;
          this._debug._m_adpcmData.arr[i].end = this._io.pos;
        }
        this._debug._m_adpcmData.end = this._io.pos;
        this._io.seek(_pos);
        return this._m_adpcmData;
      }
    });
    Object.defineProperty(Data.prototype, 'finalBlocks', {
      get: function() {
        if (this._m_finalBlocks !== undefined)
          return this._m_finalBlocks;
        var _pos = this._io.pos;
        this._io.seek((((this._root.header.dataOffset + 8) + this.header.dataOffset) + (((this._root.rstmHead.chunk1.totalBlockCount - 1) * this._root.rstmHead.chunk1.numChannels) * this._root.rstmHead.chunk1.blockSize)));
        this._debug._m_finalBlocks = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this._m_finalBlocks = new FinalBlocks(this._io, this, this._root);
        this._m_finalBlocks._read();
        this._debug._m_finalBlocks.end = this._io.pos;
        this._io.seek(_pos);
        return this._m_finalBlocks;
      }
    });

    return Data;
  })();

  var RstmHead = Rstm.RstmHead = (function() {
    function RstmHead(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;
      this._debug = {};

    }
    RstmHead.prototype._read = function() {
      this._debug.header = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.header = new Header(this._io, this, this._root);
      this.header._read();
      this._debug.header.end = this._io.pos;
    }

    var Header = RstmHead.Header = (function() {
      function Header(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
        this._debug = {};

      }
      Header.prototype._read = function() {
        this._debug.tag = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.tag = this._io.readU4be();
        this._debug.tag.end = this._io.pos;
        this._debug.size = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.size = this._io.readS4be();
        this._debug.size.end = this._io.pos;
        this._debug.entries = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.entries = new Array(3);
        this._debug.entries.arr = new Array(3);
        for (var i = 0; i < 3; i++) {
          this._debug.entries.arr[i] = { start: this._io.pos, ioOffset: this._io._byteOffset };
          var _t_entries = new Ruint(this._io, this, this._root);
          _t_entries._read();
          this.entries[i] = _t_entries;
          this._debug.entries.arr[i].end = this._io.pos;
        }
        this._debug.entries.end = this._io.pos;
      }

      return Header;
    })();

    var Chunk1 = RstmHead.Chunk1 = (function() {
      Chunk1.Codec = Object.freeze({
        EIGHT_BIT_PCM: 0,
        SIXTEEN_BIT_PCM: 1,
        FOUR_BIT_ADPCM: 2,

        0: "EIGHT_BIT_PCM",
        1: "SIXTEEN_BIT_PCM",
        2: "FOUR_BIT_ADPCM",
      });

      function Chunk1(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
        this._debug = {};

      }
      Chunk1.prototype._read = function() {
        this._debug.codec = { start: this._io.pos, ioOffset: this._io._byteOffset, enumName: "Rstm.RstmHead.Chunk1.Codec" };
        this.codec = this._io.readS1();
        this._debug.codec.end = this._io.pos;
        this._debug.loopFlag = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.loopFlag = this._io.readS1();
        this._debug.loopFlag.end = this._io.pos;
        this._debug.numChannels = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.numChannels = this._io.readS1();
        this._debug.numChannels.end = this._io.pos;
        this._debug.padding = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.padding = this._io.readBytes(1);
        this._debug.padding.end = this._io.pos;
        this._debug.sampleRate = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.sampleRate = this._io.readS2be();
        this._debug.sampleRate.end = this._io.pos;
        this._debug.padding2 = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.padding2 = this._io.readBytes(2);
        this._debug.padding2.end = this._io.pos;
        this._debug.loopStartInSamples = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.loopStartInSamples = this._io.readU4be();
        this._debug.loopStartInSamples.end = this._io.pos;
        this._debug.totalSampleCount = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.totalSampleCount = this._io.readU4be();
        this._debug.totalSampleCount.end = this._io.pos;
        this._debug.absAdpcDataOffset = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.absAdpcDataOffset = this._io.readU4be();
        this._debug.absAdpcDataOffset.end = this._io.pos;
        this._debug.totalBlockCount = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.totalBlockCount = this._io.readU4be();
        this._debug.totalBlockCount.end = this._io.pos;
        this._debug.blockSize = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.blockSize = this._io.readU4be();
        this._debug.blockSize.end = this._io.pos;
        this._debug.samplesPerBlock = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.samplesPerBlock = this._io.readU4be();
        this._debug.samplesPerBlock.end = this._io.pos;
        this._debug.finalBlockSize = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.finalBlockSize = this._io.readU4be();
        this._debug.finalBlockSize.end = this._io.pos;
        this._debug.samplesInFinalBlock = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.samplesInFinalBlock = this._io.readU4be();
        this._debug.samplesInFinalBlock.end = this._io.pos;
        this._debug.finalBlockSizePadded = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.finalBlockSizePadded = this._io.readU4be();
        this._debug.finalBlockSizePadded.end = this._io.pos;
        this._debug.samplesPerEntryAdpc = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.samplesPerEntryAdpc = this._io.readU4be();
        this._debug.samplesPerEntryAdpc.end = this._io.pos;
        this._debug.bytesPerEntryAdpc = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.bytesPerEntryAdpc = this._io.readU4be();
        this._debug.bytesPerEntryAdpc.end = this._io.pos;
      }

      return Chunk1;
    })();

    var Chunk2 = RstmHead.Chunk2 = (function() {
      Chunk2.TrackDescriptionType = Object.freeze({
        BRAWL: 0,
        OTHER: 1,

        0: "BRAWL",
        1: "OTHER",
      });

      function Chunk2(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
        this._debug = {};

      }
      Chunk2.prototype._read = function() {
        this._debug.numTracks = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.numTracks = this._io.readS1();
        this._debug.numTracks.end = this._io.pos;
        this._debug.trackDescriptionTypeUnused = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.trackDescriptionTypeUnused = this._io.readS1();
        this._debug.trackDescriptionTypeUnused.end = this._io.pos;
        this._debug.padding = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.padding = this._io.readBytes(2);
        this._debug.padding.end = this._io.pos;
      }

      var OffsetTableEntry = Chunk2.OffsetTableEntry = (function() {
        function OffsetTableEntry(_io, _parent, _root) {
          this._io = _io;
          this._parent = _parent;
          this._root = _root || this;
          this._debug = {};

        }
        OffsetTableEntry.prototype._read = function() {
          this._debug.constant = { start: this._io.pos, ioOffset: this._io._byteOffset };
          this.constant = this._io.readS1();
          this._debug.constant.end = this._io.pos;
          this._debug.trackDescriptionType = { start: this._io.pos, ioOffset: this._io._byteOffset, enumName: "Rstm.RstmHead.Chunk2.TrackDescriptionType" };
          this.trackDescriptionType = this._io.readS1();
          this._debug.trackDescriptionType.end = this._io.pos;
          this._debug.padding = { start: this._io.pos, ioOffset: this._io._byteOffset };
          this.padding = this._io.readBytes(2);
          this._debug.padding.end = this._io.pos;
          this._debug.trackDescriptionOffset = { start: this._io.pos, ioOffset: this._io._byteOffset };
          this.trackDescriptionOffset = this._io.readS4be();
          this._debug.trackDescriptionOffset.end = this._io.pos;
        }

        var TdType0 = OffsetTableEntry.TdType0 = (function() {
          function TdType0(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
            this._debug = {};

          }
          TdType0.prototype._read = function() {
            this._debug.numChannels = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.numChannels = this._io.readS1();
            this._debug.numChannels.end = this._io.pos;
            this._debug.leftChannelId = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.leftChannelId = this._io.readS1();
            this._debug.leftChannelId.end = this._io.pos;
            this._debug.rightChannelId = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.rightChannelId = this._io.readS1();
            this._debug.rightChannelId.end = this._io.pos;
          }

          return TdType0;
        })();

        var TdType1 = OffsetTableEntry.TdType1 = (function() {
          function TdType1(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
            this._debug = {};

          }
          TdType1.prototype._read = function() {
            this._debug.volume = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.volume = this._io.readS1();
            this._debug.volume.end = this._io.pos;
            this._debug.panning = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.panning = this._io.readS1();
            this._debug.panning.end = this._io.pos;
            this._debug.padding = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.padding = this._io.readBytes(6);
            this._debug.padding.end = this._io.pos;
            this._debug.numChannels = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.numChannels = this._io.readS1();
            this._debug.numChannels.end = this._io.pos;
            this._debug.leftChannelId = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.leftChannelId = this._io.readS1();
            this._debug.leftChannelId.end = this._io.pos;
            this._debug.rightChannelId = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.rightChannelId = this._io.readS1();
            this._debug.rightChannelId.end = this._io.pos;
          }

          return TdType1;
        })();
        Object.defineProperty(OffsetTableEntry.prototype, 'trackDescription', {
          get: function() {
            if (this._m_trackDescription !== undefined)
              return this._m_trackDescription;
            var _pos = this._io.pos;
            this._io.seek(((this._root.header.headOffset + 8) + this.trackDescriptionOffset));
            this._debug._m_trackDescription = { start: this._io.pos, ioOffset: this._io._byteOffset };
            switch (this.trackDescriptionType) {
            case Rstm.RstmHead.Chunk2.TrackDescriptionType.BRAWL:
              this._m_trackDescription = new TdType0(this._io, this, this._root);
              this._m_trackDescription._read();
              break;
            case Rstm.RstmHead.Chunk2.TrackDescriptionType.OTHER:
              this._m_trackDescription = new TdType1(this._io, this, this._root);
              this._m_trackDescription._read();
              break;
            }
            this._debug._m_trackDescription.end = this._io.pos;
            this._io.seek(_pos);
            return this._m_trackDescription;
          }
        });

        return OffsetTableEntry;
      })();
      Object.defineProperty(Chunk2.prototype, 'offsetTableEntry', {
        get: function() {
          if (this._m_offsetTableEntry !== undefined)
            return this._m_offsetTableEntry;
          var _pos = this._io.pos;
          this._io.seek((((this._root.header.headOffset + 8) + this._parent.header.entries[1].dataOffset) + 4));
          this._debug._m_offsetTableEntry = { start: this._io.pos, ioOffset: this._io._byteOffset };
          this._m_offsetTableEntry = new OffsetTableEntry(this._io, this, this._root);
          this._m_offsetTableEntry._read();
          this._debug._m_offsetTableEntry.end = this._io.pos;
          this._io.seek(_pos);
          return this._m_offsetTableEntry;
        }
      });

      return Chunk2;
    })();

    var Chunk3 = RstmHead.Chunk3 = (function() {
      function Chunk3(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
        this._debug = {};

      }
      Chunk3.prototype._read = function() {
        this._debug.header = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.header = new Header(this._io, this, this._root);
        this.header._read();
        this._debug.header.end = this._io.pos;
        this._debug.offsetTables = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.offsetTables = new Array(this.header.numChannels);
        this._debug.offsetTables.arr = new Array(this.header.numChannels);
        for (var i = 0; i < this.header.numChannels; i++) {
          this._debug.offsetTables.arr[i] = { start: this._io.pos, ioOffset: this._io._byteOffset };
          var _t_offsetTables = new OffsetTable(this._io, this, this._root);
          _t_offsetTables._read();
          this.offsetTables[i] = _t_offsetTables;
          this._debug.offsetTables.arr[i].end = this._io.pos;
        }
        this._debug.offsetTables.end = this._io.pos;
      }

      var Header = Chunk3.Header = (function() {
        function Header(_io, _parent, _root) {
          this._io = _io;
          this._parent = _parent;
          this._root = _root || this;
          this._debug = {};

        }
        Header.prototype._read = function() {
          this._debug.numChannels = { start: this._io.pos, ioOffset: this._io._byteOffset };
          this.numChannels = this._io.readS1();
          this._debug.numChannels.end = this._io.pos;
          this._debug.padding = { start: this._io.pos, ioOffset: this._io._byteOffset };
          this.padding = this._io.readBytes(3);
          this._debug.padding.end = this._io.pos;
        }

        return Header;
      })();

      var OffsetTable = Chunk3.OffsetTable = (function() {
        function OffsetTable(_io, _parent, _root) {
          this._io = _io;
          this._parent = _parent;
          this._root = _root || this;
          this._debug = {};

        }
        OffsetTable.prototype._read = function() {
          this._debug.marker = { start: this._io.pos, ioOffset: this._io._byteOffset };
          this.marker = this._io.readS4be();
          this._debug.marker.end = this._io.pos;
          this._debug.channelInfoOffset = { start: this._io.pos, ioOffset: this._io._byteOffset };
          this.channelInfoOffset = this._io.readS4be();
          this._debug.channelInfoOffset.end = this._io.pos;
        }

        var AdpcmChannelInformation = OffsetTable.AdpcmChannelInformation = (function() {
          function AdpcmChannelInformation(_io, _parent, _root) {
            this._io = _io;
            this._parent = _parent;
            this._root = _root || this;
            this._debug = {};

          }
          AdpcmChannelInformation.prototype._read = function() {
            this._debug.marker = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.marker = this._io.readS4be();
            this._debug.marker.end = this._io.pos;
            this._debug.adpcmChannelCoefficientOffset = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.adpcmChannelCoefficientOffset = this._io.readS4be();
            this._debug.adpcmChannelCoefficientOffset.end = this._io.pos;
            this._debug.adpcmCoefficient = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.adpcmCoefficient = new Array(16);
            this._debug.adpcmCoefficient.arr = new Array(16);
            for (var i = 0; i < 16; i++) {
              this._debug.adpcmCoefficient.arr[i] = { start: this._io.pos, ioOffset: this._io._byteOffset };
              this.adpcmCoefficient[i] = this._io.readS2be();
              this._debug.adpcmCoefficient.arr[i].end = this._io.pos;
            }
            this._debug.adpcmCoefficient.end = this._io.pos;
            this._debug.gain = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.gain = this._io.readS2be();
            this._debug.gain.end = this._io.pos;
            this._debug.initialPredictorScale = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.initialPredictorScale = this._io.readS2be();
            this._debug.initialPredictorScale.end = this._io.pos;
            this._debug.historySample1 = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.historySample1 = this._io.readS2be();
            this._debug.historySample1.end = this._io.pos;
            this._debug.historySample2 = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.historySample2 = this._io.readS2be();
            this._debug.historySample2.end = this._io.pos;
            this._debug.loopPredictorScales = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.loopPredictorScales = this._io.readS2be();
            this._debug.loopPredictorScales.end = this._io.pos;
            this._debug.loopHistorySample1 = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.loopHistorySample1 = this._io.readS2be();
            this._debug.loopHistorySample1.end = this._io.pos;
            this._debug.loopHistorySample2 = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.loopHistorySample2 = this._io.readS2be();
            this._debug.loopHistorySample2.end = this._io.pos;
            this._debug.padding = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this.padding = this._io.readBytes(2);
            this._debug.padding.end = this._io.pos;
          }

          return AdpcmChannelInformation;
        })();
        Object.defineProperty(OffsetTable.prototype, 'channelInfo', {
          get: function() {
            if (this._m_channelInfo !== undefined)
              return this._m_channelInfo;
            var _pos = this._io.pos;
            this._io.seek(((this._root.header.headOffset + 8) + this.channelInfoOffset));
            this._debug._m_channelInfo = { start: this._io.pos, ioOffset: this._io._byteOffset };
            this._m_channelInfo = new AdpcmChannelInformation(this._io, this, this._root);
            this._m_channelInfo._read();
            this._debug._m_channelInfo.end = this._io.pos;
            this._io.seek(_pos);
            return this._m_channelInfo;
          }
        });

        return OffsetTable;
      })();

      return Chunk3;
    })();
    Object.defineProperty(RstmHead.prototype, 'chunk1', {
      get: function() {
        if (this._m_chunk1 !== undefined)
          return this._m_chunk1;
        var _pos = this._io.pos;
        this._io.seek(((this._root.header.headOffset + 8) + this.header.entries[0].dataOffset));
        this._debug._m_chunk1 = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this._m_chunk1 = new Chunk1(this._io, this, this._root);
        this._m_chunk1._read();
        this._debug._m_chunk1.end = this._io.pos;
        this._io.seek(_pos);
        return this._m_chunk1;
      }
    });
    Object.defineProperty(RstmHead.prototype, 'chunk2', {
      get: function() {
        if (this._m_chunk2 !== undefined)
          return this._m_chunk2;
        var _pos = this._io.pos;
        this._io.seek(((this._root.header.headOffset + 8) + this.header.entries[1].dataOffset));
        this._debug._m_chunk2 = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this._m_chunk2 = new Chunk2(this._io, this, this._root);
        this._m_chunk2._read();
        this._debug._m_chunk2.end = this._io.pos;
        this._io.seek(_pos);
        return this._m_chunk2;
      }
    });
    Object.defineProperty(RstmHead.prototype, 'chunk3', {
      get: function() {
        if (this._m_chunk3 !== undefined)
          return this._m_chunk3;
        var _pos = this._io.pos;
        this._io.seek(((this._root.header.headOffset + 8) + this.header.entries[2].dataOffset));
        this._debug._m_chunk3 = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this._m_chunk3 = new Chunk3(this._io, this, this._root);
        this._m_chunk3._read();
        this._debug._m_chunk3.end = this._io.pos;
        this._io.seek(_pos);
        return this._m_chunk3;
      }
    });

    return RstmHead;
  })();

  var Nw4rCommonHeader = Rstm.Nw4rCommonHeader = (function() {
    function Nw4rCommonHeader(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;
      this._debug = {};

    }
    Nw4rCommonHeader.prototype._read = function() {
      this._debug.tag = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.tag = new BinTag(this._io, this, this._root);
      this.tag._read();
      this._debug.tag.end = this._io.pos;
      this._debug.endian = { start: this._io.pos, ioOffset: this._io._byteOffset, enumName: "Rstm.Endian" };
      this.endian = this._io.readU2be();
      this._debug.endian.end = this._io.pos;
      this._debug.version = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.version = this._io.readS2be();
      this._debug.version.end = this._io.pos;
      this._debug.length = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.length = this._io.readS4be();
      this._debug.length.end = this._io.pos;
      this._debug.firstOffset = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.firstOffset = this._io.readU2be();
      this._debug.firstOffset.end = this._io.pos;
      this._debug.numEntries = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.numEntries = this._io.readU2be();
      this._debug.numEntries.end = this._io.pos;
    }

    return Nw4rCommonHeader;
  })();

  var RstmHeader = Rstm.RstmHeader = (function() {
    function RstmHeader(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;
      this._debug = {};

    }
    RstmHeader.prototype._read = function() {
      this._debug.header = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.header = new Nw4rCommonHeader(this._io, this, this._root);
      this.header._read();
      this._debug.header.end = this._io.pos;
      this._debug.headOffset = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.headOffset = this._io.readS4be();
      this._debug.headOffset.end = this._io.pos;
      this._debug.headLength = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.headLength = this._io.readS4be();
      this._debug.headLength.end = this._io.pos;
      this._debug.adpcOffset = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.adpcOffset = this._io.readS4be();
      this._debug.adpcOffset.end = this._io.pos;
      this._debug.adpcLength = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.adpcLength = this._io.readS4be();
      this._debug.adpcLength.end = this._io.pos;
      this._debug.dataOffset = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.dataOffset = this._io.readS4be();
      this._debug.dataOffset.end = this._io.pos;
      this._debug.dataLength = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.dataLength = this._io.readS4be();
      this._debug.dataLength.end = this._io.pos;
    }

    return RstmHeader;
  })();

  var Adpc = Rstm.Adpc = (function() {
    function Adpc(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;
      this._debug = {};

    }
    Adpc.prototype._read = function() {
      this._debug.header = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.header = new Header(this._io, this, this._root);
      this.header._read();
      this._debug.header.end = this._io.pos;
      this._debug.samples = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this.samples = new Array((Math.floor(this.header.length / 4) - 2));
      this._debug.samples.arr = new Array((Math.floor(this.header.length / 4) - 2));
      for (var i = 0; i < (Math.floor(this.header.length / 4) - 2); i++) {
        this._debug.samples.arr[i] = { start: this._io.pos, ioOffset: this._io._byteOffset };
        var _t_samples = new ChannelHistorySample(this._io, this, this._root);
        _t_samples._read();
        this.samples[i] = _t_samples;
        this._debug.samples.arr[i].end = this._io.pos;
      }
      this._debug.samples.end = this._io.pos;
    }

    var Header = Adpc.Header = (function() {
      function Header(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
        this._debug = {};

      }
      Header.prototype._read = function() {
        this._debug.tag = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.tag = this._io.readU4be();
        this._debug.tag.end = this._io.pos;
        this._debug.length = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.length = this._io.readS4be();
        this._debug.length.end = this._io.pos;
      }

      return Header;
    })();

    var ChannelHistorySample = Adpc.ChannelHistorySample = (function() {
      function ChannelHistorySample(_io, _parent, _root) {
        this._io = _io;
        this._parent = _parent;
        this._root = _root || this;
        this._debug = {};

      }
      ChannelHistorySample.prototype._read = function() {
        this._debug.sample1 = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.sample1 = this._io.readS2be();
        this._debug.sample1.end = this._io.pos;
        this._debug.sample2 = { start: this._io.pos, ioOffset: this._io._byteOffset };
        this.sample2 = this._io.readS2be();
        this._debug.sample2.end = this._io.pos;
      }

      return ChannelHistorySample;
    })();

    return Adpc;
  })();
  Object.defineProperty(Rstm.prototype, 'rstmHead', {
    get: function() {
      if (this._m_rstmHead !== undefined)
        return this._m_rstmHead;
      var _pos = this._io.pos;
      this._io.seek(this.header.headOffset);
      this._debug._m_rstmHead = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this._m_rstmHead = new RstmHead(this._io, this, this._root);
      this._m_rstmHead._read();
      this._debug._m_rstmHead.end = this._io.pos;
      this._io.seek(_pos);
      return this._m_rstmHead;
    }
  });
  Object.defineProperty(Rstm.prototype, 'adpc', {
    get: function() {
      if (this._m_adpc !== undefined)
        return this._m_adpc;
      var _pos = this._io.pos;
      this._io.seek(this.header.adpcOffset);
      this._debug._m_adpc = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this._m_adpc = new Adpc(this._io, this, this._root);
      this._m_adpc._read();
      this._debug._m_adpc.end = this._io.pos;
      this._io.seek(_pos);
      return this._m_adpc;
    }
  });
  Object.defineProperty(Rstm.prototype, 'data', {
    get: function() {
      if (this._m_data !== undefined)
        return this._m_data;
      var _pos = this._io.pos;
      this._io.seek(this.header.dataOffset);
      this._debug._m_data = { start: this._io.pos, ioOffset: this._io._byteOffset };
      this._m_data = new Data(this._io, this, this._root);
      this._m_data._read();
      this._debug._m_data.end = this._io.pos;
      this._io.seek(_pos);
      return this._m_data;
    }
  });

  return Rstm;
})();
return Rstm;
})
