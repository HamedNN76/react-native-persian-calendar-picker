/**
 * Persian Calendar Picker Component
 *
 * Copyright 2016 Reza (github.com/rghorbani)
 * Licensed under the terms of the MIT license. See LICENSE file in the project root for terms.
 */

'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const jMoment = require('moment-jalaali');
const { Text, TouchableOpacity, View } = require('react-native');
const pholiday = require('pholiday');

function Day(props) {
  const {
    day,
    month,
    year,
    styles,
    customDatesStyles,
    onPressDay,
    selectedStartDate,
    selectedEndDate,
    allowRangeSelection,
    selectedDayStyle,
    selectedRangeStartStyle,
    selectedRangeStyle,
    selectedRangeEndStyle,
    textStyle,
    todayTextStyle,
    minDate,
    maxDate,
    disabledDates,
    minRangeDuration,
    maxRangeDuration,
    enableDateChange,
  } = props;

  const thisDay = jMoment
    .utc()
    .jYear(year)
    .jMonth(month)
    .jDate(day);
  const today = jMoment();

  let dateOutOfRange;
  let daySelectedStyle = styles.dayButton; // may be overridden depending on state
  let selectedDayColorStyle = {};
  let propSelectedDayStyle;
  let dateIsBeforeMin = false;
  let dateIsAfterMax = false;
  let dateIsDisabled = false;
  let dateIsBeforeMinDuration = false;
  let dateIsAfterMaxDuration = false;
  let customContainerStyle, customDateStyle, customTextStyle;

  // First let's check if date is out of range
  // Check whether props maxDate / minDate are defined. If not supplied,
  // don't restrict dates.
  if (maxDate) {
    dateIsAfterMax = thisDay.isAfter(maxDate, 'day');
  }
  if (minDate) {
    dateIsBeforeMin = thisDay.isBefore(minDate, 'day');
  }

  if (disabledDates && disabledDates.indexOf(thisDay.valueOf()) >= 0) {
    dateIsDisabled = true;
  }

  if (
    allowRangeSelection &&
    minRangeDuration &&
    selectedStartDate &&
    thisDay.isAfter(jMoment(selectedStartDate), 'day')
  ) {
    if (Array.isArray(minRangeDuration)) {
      let i = minRangeDuration.findIndex(i =>
        jMoment(i.date).isSame(jMoment(selectedStartDate, 'day')),
      );
      if (
        i >= 0 &&
        jMoment(selectedStartDate)
          .add(minRangeDuration[i].minDuration, 'day')
          .isAfter(thisDay, 'day')
      ) {
        dateIsBeforeMinDuration = true;
      }
    } else if (
      jMoment(selectedStartDate)
        .add(minRangeDuration, 'day')
        .isAfter(thisDay, 'day')
    ) {
      dateIsBeforeMinDuration = true;
    }
  }

  if (
    allowRangeSelection &&
    maxRangeDuration &&
    selectedStartDate &&
    thisDay.isAfter(jMoment(selectedStartDate), 'day')
  ) {
    if (Array.isArray(maxRangeDuration)) {
      let i = maxRangeDuration.findIndex(i =>
        jMoment(i.date).isSame(jMoment(selectedStartDate, 'day')),
      );
      if (
        i >= 0 &&
        jMoment(selectedStartDate)
          .add(maxRangeDuration[i].maxDuration, 'day')
          .isBefore(thisDay, 'day')
      ) {
        dateIsAfterMaxDuration = true;
      }
    } else if (
      jMoment(selectedStartDate)
        .add(maxRangeDuration, 'day')
        .isBefore(thisDay, 'day')
    ) {
      dateIsAfterMaxDuration = true;
    }
  }

  dateOutOfRange =
    dateIsAfterMax ||
    dateIsBeforeMin ||
    dateIsDisabled ||
    dateIsBeforeMinDuration ||
    dateIsAfterMaxDuration;

  // If date is in range let's apply styles
  if (!dateOutOfRange) {
    // set today's style
    let isToday = thisDay.isSame(today, 'day');
    if (isToday) {
      daySelectedStyle = styles.selectedToday;
      // todayTextStyle prop overrides selectedDayTextColor (created via makeStyles)
      selectedDayColorStyle = todayTextStyle || styles.selectedDayLabel;
    }

    for (let cds of customDatesStyles) {
      if (thisDay.isSame(jMoment.utc(cds.date), 'day')) {
        customContainerStyle = cds.containerStyle;
        customDateStyle = cds.style;
        customTextStyle = cds.textStyle;
        if (isToday && customDateStyle) {
          // Custom date style overrides 'today' style. It may be reset below
          // by date selection styling.
          daySelectedStyle = [daySelectedStyle, customDateStyle];
        }
        break;
      }
    }

    let isThisDaySameAsSelectedStart = thisDay.isSame(selectedStartDate, 'day');
    let isThisDaySameAsSelectedEnd = thisDay.isSame(selectedEndDate, 'day');

    // set selected day style
    if (
      !allowRangeSelection &&
      selectedStartDate &&
      isThisDaySameAsSelectedStart
    ) {
      daySelectedStyle = styles.selectedDay;
      selectedDayColorStyle = [
        styles.selectedDayLabel,
        isToday && todayTextStyle,
      ];
      // selectedDayStyle prop overrides selectedDayColor (created via makeStyles)
      propSelectedDayStyle = selectedDayStyle || styles.selectedDayBackground;
    }

    // Set selected ranges styles
    if (allowRangeSelection) {
      if (selectedStartDate && selectedEndDate) {
        // Apply style for start date
        if (isThisDaySameAsSelectedStart) {
          daySelectedStyle = [
            styles.startDayWrapper,
            selectedRangeStyle,
            selectedRangeStartStyle,
          ];
          selectedDayColorStyle = styles.selectedDayLabel;
        }
        // Apply style for end date
        if (isThisDaySameAsSelectedEnd) {
          daySelectedStyle = [
            styles.endDayWrapper,
            selectedRangeStyle,
            selectedRangeEndStyle,
          ];
          selectedDayColorStyle = styles.selectedDayLabel;
        }
        // Apply style if start date is the same as end date
        if (
          isThisDaySameAsSelectedEnd &&
          isThisDaySameAsSelectedStart &&
          selectedEndDate.isSame(selectedStartDate, 'day')
        ) {
          daySelectedStyle = [
            styles.selectedDay,
            styles.selectedDayBackground,
            selectedRangeStyle,
          ];
          selectedDayColorStyle = styles.selectedDayLabel;
        }
        // Apply style if this day is in range
        if (thisDay.isBetween(selectedStartDate, selectedEndDate, 'day')) {
          daySelectedStyle = [styles.inRangeDay, selectedRangeStyle];
          selectedDayColorStyle = styles.selectedDayLabel;
        }
      }
      // Apply style if start date has been selected but end date has not
      if (
        selectedStartDate &&
        !selectedEndDate &&
        isThisDaySameAsSelectedStart
      ) {
        daySelectedStyle = [
          styles.startDayWrapper,
          selectedRangeStyle,
          selectedRangeStartStyle,
        ];
        selectedDayColorStyle = styles.selectedDayLabel;
      }
    }

    const isHoliday = pholiday(
      `${year}/${Number(month) + 1}/${day}`,
      'jYYYY/jM/jD',
    )
      .events()
      .find(event => event.isHoliday);
    const holidayStyle = isHoliday ? { backgroundColor: 'red' } : {};

    return (
      <View style={[styles.dayWrapper, customContainerStyle]}>
        <TouchableOpacity
          disabled={!enableDateChange}
          style={[
            holidayStyle,
            customDateStyle,
            daySelectedStyle,
            propSelectedDayStyle,
          ]}
          onPress={() => onPressDay(day)}
        >
          <Text
            style={[
              styles.dayLabel,
              textStyle,
              customTextStyle,
              selectedDayColorStyle,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    // dateOutOfRange = true
    return (
      <View style={styles.dayWrapper}>
        <Text style={[textStyle, styles.disabledText]}>{day}</Text>
      </View>
    );
  }
}

Day.defaultProps = {
  customDatesStyles: [],
};

Day.propTypes = {
  styles: PropTypes.shape({}),
  day: PropTypes.number,
  onPressDay: PropTypes.func,
  disabledDates: PropTypes.array,
  minRangeDuration: PropTypes.oneOfType([PropTypes.array, PropTypes.number]),
  maxRangeDuration: PropTypes.oneOfType([PropTypes.array, PropTypes.number]),
};

module.exports = Day;
