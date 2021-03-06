/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define([
  "./AxisPosition",
  "../Structure",
  "../_WithStructure",
  "../_WithCellTupleBase",
  "../Collection",
  "../../_utils"
], function(AxisPosition, Structure, WithStructure, WithCellTupleBase, Collection, utils) {

  // keyArgs: structure
  function Axis(keyArgs) {
    WithStructure.call(this, keyArgs);
    WithCellTupleBase.call(this, keyArgs);
    Collection.call(this);
  }

  utils.inherit(Axis, Collection, WithStructure, WithCellTupleBase, {

    //region List implementation
    _cachedKeyArgs: null,
    _cachedPosSpec: null,

    elemClass: AxisPosition,

    _cast: function(cellSpecs, index) {

      var keyArgs = this._cachedKeyArgs || (this._cachedKeyArgs = {ordinal: 0});
      var posSpec = this._cachedPosSpec || (this._cachedPosSpec = {cells: null});

      keyArgs.ordinal = index;
      posSpec.cells = this.toCellTuple(cellSpecs);

      var pos = new AxisPosition(posSpec, keyArgs);

      // Free memory on cached pos spec.
      posSpec.cells = null;

      return pos;
    },
    //endregion

    //region Collection implementation

    // Allow get/has by using a positionSpec/cellSpecs
    _castKey: function(key) {
      return (typeof key === "string") ? key : this.toCellTuple(key);
    },
    //endregion

    intern: function(cellSpecs) {
      var cellTuple = this.toCellTuple(cellSpecs);

      return this.get(cellTuple.key) || this.add(cellTuple);
    },

    //region ISpecifiable implementation
    toSpec: function() {
      return this.map(function(axisPos) { return axisPos.toSpec(); });
    }
    //endregion
  });

  // ------

  // spec: [Array]
  // keyArgs: structure
  Axis.to = function(axisSpec, keyArgs) {
    if(axisSpec != null && !(axisSpec instanceof Array)) throw utils.error.argInvalid("axisSpec", "Not an array.");

    return utils.setClass(axisSpec || [], Axis, keyArgs);
  };

  return Axis;
});