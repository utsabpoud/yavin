/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { helper } from '@ember/component/helper';
import { isEmpty } from '@ember/utils';
import numeral from 'numeral';

/**
 * @method formatTableCell
 *
 * format value based on user specified value or smart format
 * @param {Number} value
 * @param {String} format
 * @param {Boolean} shouldSmartFormat
 * @returns {String}
 */
export function formatTableCell([value, format]) {
  if (isEmpty(value)) {
    return '--';
  }

  if (format) {
    return numeral(value).format(format);
  }

  return value;
}

export default helper(formatTableCell);
