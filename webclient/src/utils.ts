import moment from 'moment';
import { CreateElement } from 'vue';

export const dateFormat = (
  date: string | number | undefined,
  format: string = 'YYYY-MM-DD',
) => {
  if (!date) {
    return '';
  }
  return moment(date).format(format);
};

export const dateDifference = (
  start: string,
  end: string,
  nullReplacer = '',
) => {
  const duration = moment
    .duration(moment(end).diff(moment(start)))
    .asMilliseconds();
  if (isNaN(duration)) {
    return nullReplacer;
  }
  return moment.utc(duration).format('HH:mm:ss');
};

export const sizeFormat = (byte: number): string | number => {
  const MB = 2 ** 20;
  const KB = 2 ** 10;

  if (byte > MB) {
    return (byte / MB).toFixed(2) + 'M';
  } else if (byte > KB) {
    return (byte / KB).toFixed(2) + 'K';
  }
  return byte;
};

export const getCookie = function(sKey: string) {
  if (!sKey) {
    return null;
  }
  //eslint-disable-next-line no-useless-escape
  return (
    decodeURIComponent(
      document.cookie.replace(
        new RegExp(
          '(?:(?:^|.*;)\\s*' +
            encodeURIComponent(sKey).replace(/[-.+*]/g, '\\$&') +
            '\\s*\\=\\s*([^;]*).*$)|^.*$',
        ),
        '$1',
      ),
    ) || null
  );
};

export const renderNull = function(
  h: CreateElement,
  row: { row: { [key: string]: any } },
  key = '',
  replacer = '0',
) {
  let value = row.row[key];
  if (value !== null && value !== undefined) {
    return h('span', value);
  }
  return h('span', replacer);
};
