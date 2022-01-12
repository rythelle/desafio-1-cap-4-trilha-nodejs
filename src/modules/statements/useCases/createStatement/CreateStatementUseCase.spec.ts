import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Statements", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to deposit a new statement", async () => {
    const user = {
      name: "John",
      email: "john@gmail.com",
      password: "123456",
    };

    const userCreated = await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const statement = {
      type: "deposit",
      amount: 100.5,
      description: "Food",
    };

    const deposit = await createStatementUseCase.execute({
      user_id: userCreated.id as string,
      type: statement.type as OperationType,
      amount: statement.amount,
      description: statement.description,
    });

    const balance = await getBalanceUseCase.execute({
      user_id: userCreated.id as string,
    });

    expect(deposit).toHaveProperty("id");
    expect(balance.balance).toEqual(100.5);
  });

  it("should be able to withdraw a statement", async () => {
    const user = {
      name: "John",
      email: "john@gmail.com",
      password: "123456",
    };

    const userCreated = await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const statement = {
      type: "deposit",
      amount: 100.5,
      description: "Food",
    };

    const deposit = await createStatementUseCase.execute({
      user_id: userCreated.id as string,
      type: statement.type as OperationType,
      amount: statement.amount,
      description: statement.description,
    });

    await createStatementUseCase.execute({
      user_id: userCreated.id as string,
      type: "withdraw" as OperationType,
      amount: 50.5,
      description: "Gas",
    });

    const balance = await getBalanceUseCase.execute({
      user_id: userCreated.id as string,
    });

    expect(deposit).toHaveProperty("id");
    expect(balance.balance).toEqual(50);
  });
});
