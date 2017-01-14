--
-- Table structure for table `circle`
--

DROP TABLE IF EXISTS `circle`;
CREATE TABLE IF NOT EXISTS `circle` (
  `cid` int(11) NOT NULL,
  `circlename` varchar(45) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `ownerid` int(11) DEFAULT NULL,
  PRIMARY KEY (`cid`),
  KEY `owner_fk_idx` (`ownerid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


--
-- Table structure for table `circleuser`
--

DROP TABLE IF EXISTS `circleuser`;
CREATE TABLE IF NOT EXISTS `circleuser` (
  `uid` int(11) NOT NULL,
  `cid` int(11) NOT NULL,
  `add` tinyint(1) NOT NULL,
  `edit` tinyint(1) NOT NULL,
  `remove` tinyint(1) NOT NULL,
  PRIMARY KEY (`uid`,`cid`),
  KEY `fk_CIRCLEUSER_CIRCLE1_idx` (`cid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


--
-- Table structure for table `event`
--

DROP TABLE IF EXISTS `event`;
CREATE TABLE IF NOT EXISTS `event` (
  `eid` int(11) NOT NULL,
  `eventname` varchar(100) NOT NULL,
  `eventdesc` text NOT NULL,
  `start` datetime DEFAULT NULL,
  `end` datetime DEFAULT NULL,
  PRIMARY KEY (`eid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


--
-- Table structure for table `eventcircle`
--

DROP TABLE IF EXISTS `eventcircle`;
CREATE TABLE IF NOT EXISTS `eventcircle` (
  `cid` int(11) NOT NULL,
  `eid` int(11) NOT NULL,
  PRIMARY KEY (`cid`,`eid`),
  KEY `fk_EVENTCIRCLE_CIRCLE1_idx` (`cid`),
  KEY `fk_EVENTCIRCLE_EVENT1_idx` (`eid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


--
-- Table structure for table `eventuser`
--

DROP TABLE IF EXISTS `eventuser`;
CREATE TABLE IF NOT EXISTS `eventuser` (
  `uid` int(11) NOT NULL,
  `eid` int(11) NOT NULL,
  PRIMARY KEY (`uid`,`eid`),
  KEY `fk_EVENTUSER_EVENT1_idx` (`eid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


--
-- Table structure for table `group`
--

DROP TABLE IF EXISTS `group`;
CREATE TABLE IF NOT EXISTS `group` (
  `gid` int(11) NOT NULL,
  `groupname` varchar(45) NOT NULL,
  `useredit` tinyint(1) NOT NULL,
  `circleedit` tinyint(1) NOT NULL,
  PRIMARY KEY (`gid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Inserting data into table `group`
--

INSERT INTO `group` (`gid`, `groupname`, `useredit`, `circleedit`) VALUES
(0, 'Admin', 1, 1),
(1, 'User', 0, 0);


--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `uid` int(11) NOT NULL,
  `gid` int(11) NOT NULL,
  `username` varchar(45) NOT NULL,
  `password` char(40) NOT NULL,
  `salt` char(40) NOT NULL,
  `mail` varchar(100) NOT NULL,
  `gender` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`uid`,`gid`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  KEY `fk_USER_GROUP1_idx` (`gid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `circle`
--
ALTER TABLE `circle`
  ADD CONSTRAINT `owner_fk` FOREIGN KEY (`ownerid`) REFERENCES `user` (`uid`) ON DELETE SET NULL ON UPDATE NO ACTION;

--
-- Constraints for table `circleuser`
--
ALTER TABLE `circleuser`
  ADD CONSTRAINT `fk_CIRCLEUSER_CIRCLE1` FOREIGN KEY (`cid`) REFERENCES `circle` (`cid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_CIRCLEUSER_USER1` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `eventcircle`
--
ALTER TABLE `eventcircle`
  ADD CONSTRAINT `fk_EVENTCIRCLE_CIRCLE1` FOREIGN KEY (`cid`) REFERENCES `circle` (`cid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_EVENTCIRCLE_EVENT1` FOREIGN KEY (`eid`) REFERENCES `event` (`eid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `eventuser`
--
ALTER TABLE `eventuser`
  ADD CONSTRAINT `fk_EVENTUSER_EVENT1` FOREIGN KEY (`eid`) REFERENCES `event` (`eid`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_EVENTUSER_USER1` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `fk_USER_GROUP1` FOREIGN KEY (`gid`) REFERENCES `group` (`gid`) ON DELETE NO ACTION ON UPDATE NO ACTION;

