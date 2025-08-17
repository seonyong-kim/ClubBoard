package com.example.demo;

import com.example.demo.repository.UserAccountRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	// 임시: 해시 뽑고 나면 삭제하세요
	@Bean
	CommandLineRunner printUser1234Hash(PasswordEncoder enc) {
		return args -> System.out.println("BCrypt(user1234) = " + enc.encode("user1234"));
	}

	@Bean
	CommandLineRunner checkPassword(UserAccountRepository repo, PasswordEncoder enc) {
		return args -> {
			var u = repo.findByUsername("user");
			if (u.isEmpty()) { System.out.println("[CHECK] user 없음"); return; }

			String dbHash = u.get().getPassword();
			System.out.println("[CHECK] len=" + (dbHash == null ? "null" : dbHash.length()));
			System.out.println("[CHECK] head=" + (dbHash == null ? "null" : dbHash.substring(0, Math.min(7, dbHash.length()))));
			System.out.println("[CHECK] tail=" + (dbHash == null ? "null" : dbHash.substring(Math.max(0, dbHash.length()-7))));
			System.out.println("[CHECK] HEX tail=" + (dbHash == null ? "null" : dbHash.substring(Math.max(0, dbHash.length()-1))));
			System.out.println("[CHECK] matches('user1234', dbHash) = " + enc.matches("user1234", dbHash));
		};
	}

	@Bean
	CommandLineRunner whereAmI(javax.sql.DataSource ds, com.example.demo.repository.UserAccountRepository repo) {
		return args -> {
			try (var c = ds.getConnection(); var st = c.createStatement()) {
				try (var rs = st.executeQuery("SELECT DATABASE()")) {
					if (rs.next()) System.out.println("[DB] DATABASE() = " + rs.getString(1));
				}
				try (var rs = st.executeQuery("SELECT username, LENGTH(password) len, password FROM users WHERE username='user'")) {
					while (rs.next()) {
						System.out.println("[DB] user row = " + rs.getString("username")
								+ ", len=" + rs.getInt("len")
								+ ", tail=" + rs.getString("password").substring(53)); // 마지막 7글자
					}
				}
			}
		};
	}

}
