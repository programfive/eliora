
export const formatMessage = (content: string) => {
    return content
      .replace(/\n/g, '<br />')
      .replace(/\. ([A-Z])/g, '.<br /><br />$1')
      .replace(/: ([A-Z])/g, ':<br />$1')
      .replace(/(\d+\.\s)/g, '<br />$1')
      .replace(/(-\s)/g, '<br />$1')
      .replace(/\? ([A-Z])/g, '?<br /><br />$1')
      .replace(/(<br\s*\/?>){3,}/g, '<br /><br />')
      .replace(/^(<br\s*\/?>)+/, '');
  };
  