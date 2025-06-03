function handleWrongAnswer() {
  try {
    const parentLocalStorage = window.parent.localStorage;
    const current = parentLocalStorage.getItem('wrongAnswerCount');

    if (current === null) {
      parentLocalStorage.setItem('wrongAnswerCount', '1');
    } else {
      let count = parseInt(current, 10);
      if (isNaN(count)) {
        count = 1;
      } else {
        count += 1;
      }
      parentLocalStorage.setItem('wrongAnswerCount', count.toString());
    }
  } catch (error) {
    console.error('Failed to access localStorage of the parent window:', error);
  }
}
