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
  "./_OfAttribute",
  "./Member",
  "./_Annotatable",
  "../_utils"
], function(OfAttribute, Member, Annotatable, utils) {

  // A cell is like a place or location or position.
  // A cell has an address in a given subject.
  // A cell is not a thing per se.
  // The thing is the value of the Cell,
  //  and the label of the cell is an optional, contextual label of the cell's value.
  // Because a place, while existent, doesn't change, then the cell itself should not be settable,
  //  but only its value and/or label.
  // We opt to receive the _ids_ of members in cell values, and not the corresponding member itself.
  // We provide a "referent" property that gets or sets the corresponding member.
  // For all these to be practically possible, the cell needs to store (or inherit) a ref to the attribute that
  //  its values are based on for validating set values directly.

  /**
   * @classdesc The `Cell` class represents a location or position,
   * in which the value of an attribute, for a given subject, is stored.
   *
   * ### AMD
   *
   * To obtain the constructor of this class,
   * require the module `"pentaho/visual/data/Cell"`.
   *
   * ### Remarks
   *
   * A cell does not hold a reference to its subject.
   *
   * A cell holds a reference to its attribute through property
   * {@link pentaho.visual.data.Cell#attribute}.
   *
   * The value of a cell is exposed through property
   * {@link pentaho.visual.data.Cell#value}.
   *
   * Besides holding the value of an attribute,
   * a cell can also hold a _context specific_, human-readable
   * label of that value. See {@link pentaho.visual.data.Cell#label}.
   *
   * Also, because a cell is an {@link pentaho.visual.data.IAnnotatable},
   * any desired data can be associated with it.
   *
   * When a cell is associated with a discrete attribute,
   * setting its value to a _non-nully_ value
   * automatically registers the value as a member of the attribute
   * (i.e. a member which has that value).
   * The {@link pentaho.visual.data.Cell#referent} property exposes that member.
   *
   * @description An initialization constructor that
   * initializes a cell instance assuming it was
   * converted from a cell specification object,
   * {@link pentaho.visual.data.ICellSpec}.
   *
   * Cells cannot be constructed directly.
   * Instead, because cells always have an associated attribute,
   * they should be created by using its attribute's
   * {@link pentaho.visual.data.Attribute#toCellOf} method.
   *
   * @class
   * @memberOf pentaho.visual.data
   * @abstract
   * @implements pentaho.visual.data.ISpecifiable
   * @implements pentaho.visual.data.IAnnotatable
   */
  function Cell() {
    this.value = this.v;
    this.label = this.f;

    Annotatable.call(this);
  }

  var annotProto = Annotatable.prototype;

  utils.implement(Cell, Annotatable, /** @lends pentaho.visual.data.Cell# */ {

    //region IListElement
    elemName: "cell",
    //endregion

    //region IWithKey implementation
    keyName:  "value",

    /**
     * Gets the key of the cell.
     *
     * When a cell contains the `null` value, its key is the empty string, `""`.
     * When a cell is discrete (and is not `null`), its key is that of its referent.
     * Otherwise, the key is the result of calling its value's `toString` method.
     *
     * @type string
     * @readonly
     */
    get key() {
      var v = this.v;
      if(v == null) return "";

      if(v instanceof Member) return v.key;

      return v.toString();
    },
    //endregion

    //region IOfAttribute abstract implementation
    /**
     * Gets the attribute of the cell.
     *
     * A cell's attribute determines the type of the values it can contain
     * (see {@link pentaho.visual.data.Attribute#type}).
     *
     * Also, a cell is **discrete** iif its attribute is discrete
     * (see {@link pentaho.visual.data.Attribute#type}).
     *
     * @type !pentaho.visual.data.Attribute
     * @abstract
     * @readonly
     */
    get attribute() {
      throw new Error("abstract");
    },
    //endregion

    /**
     * Gets or sets the value of the cell.
     *
     * A cell's attribute determines the type of the values it can hold
     * (see {@link pentaho.visual.data.Attribute#type}).
     *
     * However, whatever its type, a cell **can** hold the `null` value.
     * Also, when a cell is set to value `undefined`, it is instead set to the `null` value.
     *
     * When a cell is associated with a discrete attribute,
     * setting it to a _non-nully_ value automatically registers it as a member of the attribute
     * (i.e. a member which has that value).
     * The {@link pentaho.visual.data.Cell#referent} property exposes that member.
     *
     * @type ?pentaho.visual.data.Atomic
     */
    get value() {
      return this.v;
    },

    set value(v) {
      if(v == null) {
        this.v = null; // undefined to null normalization
      } else {
        // auto-create member
        if(this.attribute.isDiscrete)
          this.attribute.members.getOrAdd(v);
        this.v = v;
      }
    },

    /**
     * Indicates if the cell has the value `null`.
     * @type boolean
     * @readonly
     */
    get isEmpty() {
      return this.v == null;
    },

    /**
     * Gets or sets the referent of the cell.
     *
     * On a discrete cell,
     * this property is synchronized with the
     * {@link pentaho.visual.data.Cell#value} property.
     * It holds the member of the cell's attribute
     * whose value is the cell's value.
     *
     * Trying to set this property to a member which
     * does not belong to its attribute's members,
     * throws an error.
     *
     * On a non-discrete cell,
     * getting this property returns `null`,
     * while trying to set it (to any value) throws an error.
     *
     * @type pentaho.visual.data.Member
     */
    get referent() {
      var v = this.v;
      if(v == null) return null;

      if(this.attribute.isDiscrete)
        return this.attribute.members.get(v);
    },

    set referent(member) {
      if(!this.attribute.isDiscrete) throw new Error("Invalid operation");

      if(member == null) {
        this.v = null;
      } else {
        if(!this.attribute.members.includes(member))
          throw utils.error.argInvalid("member", "Not a member of the the cell's attribute.");

        this.v = member.value;
      }
    },

    /**
     * Gets or sets the label of the cell.
     *
     * The label of a cell is a _context specific_, human-readable
     * short description of its value.
     *
     * Setting the label of a cell to either `null` or `undefined`
     * always sets it to `undefined`, which is considered **unspecified**.
     *
     * On a discrete cell that
     * has a non-null value (and thus has a referent)
     * and an unspecified label,
     * getting its label returns its referent's label.
     *
     * If a never-nully string representation of this cell is needed,
     * use the {@link pentaho.visual.data.Cell#toString} method instead.
     *
     * @type string
     */
    get label() {
      var f, r;
      return ((f = this.f) != null || !(r = this.referent)) ? f : r.label;
    },

    set label(f) {
      this.f = f == null ? undefined : String(f);
    },

    /**
     * Gets a best-effort string representation of the cell.
     *
     * When the result of the label property of the cell is defined, it is returned.
     * Otherwise, if the value of the cell is defined, its string representation is returned.
     * Otherwise, the empty string, `""`, is returned.
     *
     * @return {string} A string representation of the cell.
     */
    toString: function() {
      var f;
      return (f = this.label) != null ? f : (f = this.v) != null ? f.toString() : "";
    },

    //region ISpecifiable implementation
    /**
     * Gets the specification of the cell.
     *
     * When the cell has no specified label or annotations,
     * its value — a {@link pentaho.visual.data.Atomic} or `null` is returned.
     *
     * Otherwise,
     * an object with properties `v`, `f` and `p` is returned,
     * containing the specified value of the properties
     * {@link pentaho.visual.data.Cell#value},
     * {@link pentaho.visual.data.Cell#label}
     * and
     * {@link pentaho.visual.data.IAnnotatable#property},
     * respectively.
     *
     * @return {pentaho.visual.data.Atomic|Object|null} The specification of the cell.
     */
    toSpec: function() {
      // Don't output a result object if it only has a null value and label.
      var result = null,
          v = this.v,
          f = this.f;

      if(this.p) {
        result = {};
        if(v != null) result.v = v;
        if(f != null) result.f = f;
        result = annotProto.toSpec.call(this, result);
      } else if(f != null) {
        result = {};
        if(v != null) result.v = v;
        result.f = f;
      } else if(v != null) {
        result = v;
      }

      return result;
    }
    //endregion
  });

  // --------

  function AdhocCell(keyArgs) {
    OfAttribute.call(this, keyArgs);
    Cell.call(this, keyArgs);
  }

  utils.inherit(AdhocCell, Cell, OfAttribute);

  Cell.Adhoc = AdhocCell;

  // --------

  return Cell;
});